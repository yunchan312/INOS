import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BookWork } from '@prisma/client';
import axios, { AxiosInstance } from 'axios';
import type { BookWorkDto, SeojiBookSearchItemDto } from '@inos/types';
import { PrismaService } from '../../prisma/prisma.service';

const DEFAULT_SEOJI_BASE_URL = 'https://www.nl.go.kr/seoji';
const SEARCH_PATH = '/SearchApi.do';

/** 같은 책의 여러 판·쇄가 섞여 나오므로 ISBN 중복을 걸러낼 여유분을 두고 받는다 */
const SEARCH_FETCH_SIZE = 20;
const SEARCH_RESULT_LIMIT = 10;
/** ISBN 조회는 정확 매칭이지만 세트/낱권이 함께 잡힐 수 있어 몇 건만 본다 */
const DETAIL_FETCH_SIZE = 5;
/** 키 입력 연타로 같은 질의가 반복될 때를 위한 짧은 메모리 캐시 */
const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;
const SEARCH_CACHE_MAX = 100;
/** 저장된 책 정보를 다시 받아올 주기 (표지 교체·서지 정정을 반영) */
const REFETCH_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

/** SEOJI 응답은 모든 값이 문자열이고, 빈 값은 null이 아니라 ""로 온다 */
interface SeojiDoc {
  TITLE?: string;
  SERIES_TITLE?: string;
  AUTHOR?: string;
  PUBLISHER?: string;
  EA_ISBN?: string;
  SET_ISBN?: string;
  PUBLISH_PREDATE?: string;
  PAGE?: string;
  KDC?: string;
  SUBJECT?: string;
  TITLE_URL?: string;
  BOOK_TB_CNT_URL?: string;
  BOOK_INTRODUCTION_URL?: string;
}

interface SeojiResponse {
  RESULT?: string;
  ERR_CODE?: string;
  ERR_MESSAGE?: string;
  TOTAL_COUNT?: string;
  PAGE_NO?: string;
  docs?: SeojiDoc[];
}

@Injectable()
export class SeojiService {
  private readonly logger = new Logger(SeojiService.name);
  private readonly certKey: string;
  private readonly http: AxiosInstance;
  private readonly searchCache = new Map<
    string,
    { at: number; items: SeojiBookSearchItemDto[] }
  >();

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.certKey = config.get<string>('SEOJI_CERT_KEY', '').trim();
    // 로컬 검증용으로 다른 엔드포인트를 가리킬 수 있게 열어둔다
    const baseURL = config.get<string>('SEOJI_BASE_URL', DEFAULT_SEOJI_BASE_URL);
    this.http = axios.create({ baseURL, timeout: 8000 });
  }

  get isConfigured(): boolean {
    return this.certKey.length > 0;
  }

  /**
   * 책 제목 자동완성. TMDB와 달리 검색 응답 한 번에 저자·출판사·표지가 모두 담겨
   * 오므로 결과당 추가 조회가 없다.
   */
  async search(rawQuery: string): Promise<SeojiBookSearchItemDto[]> {
    const query = rawQuery.trim();
    if (query.length < 2) return [];
    this.assertConfigured();

    const cached = this.searchCache.get(query);
    if (cached && Date.now() - cached.at < SEARCH_CACHE_TTL_MS) {
      return cached.items;
    }

    const docs = await this.request({
      title: query,
      page_size: SEARCH_FETCH_SIZE,
    });

    const items: SeojiBookSearchItemDto[] = [];
    const seen = new Set<string>();
    for (const doc of docs) {
      // ISBN이 곧 우리 쪽 키다. 없는 행은 확정할 수 없으니 후보에서 뺀다
      const isbn13 = normalizeIsbn(doc.EA_ISBN);
      if (!isbn13 || seen.has(isbn13)) continue;
      seen.add(isbn13);
      items.push({
        isbn13,
        title: nullify(doc.TITLE) ?? '(제목 없음)',
        author: nullify(doc.AUTHOR),
        publisher: nullify(doc.PUBLISHER),
        publishYear: parseYear(doc.PUBLISH_PREDATE),
        coverUrl: nullify(doc.TITLE_URL),
      });
      if (items.length >= SEARCH_RESULT_LIMIT) break;
    }

    this.rememberSearch(query, items);
    return items;
  }

  /**
   * ISBN으로 책을 확정해 book_works에 적재하고 그 행을 돌려준다.
   * 이미 있고 최근에 받아온 것이면 SEOJI를 다시 부르지 않는다 (이 테이블이 곧 캐시).
   */
  async resolveBookWork(rawIsbn: string): Promise<BookWork> {
    const isbn13 = normalizeIsbn(rawIsbn);
    if (!isbn13) {
      throw new BadRequestException('ISBN은 13자리 숫자여야 합니다');
    }

    const existing = await this.prisma.bookWork.findUnique({ where: { isbn13 } });
    if (existing && Date.now() - existing.fetchedAt.getTime() < REFETCH_AFTER_MS) {
      return existing;
    }

    this.assertConfigured();
    const docs = await this.request({ isbn: isbn13, page_size: DETAIL_FETCH_SIZE });
    const doc = docs.find((d) => normalizeIsbn(d.EA_ISBN) === isbn13);
    if (!doc) {
      throw new NotFoundException('국립중앙도서관에서 해당 도서를 찾을 수 없습니다');
    }

    const data = {
      isbn13,
      setIsbn: normalizeIsbn(doc.SET_ISBN),
      title: nullify(doc.TITLE) ?? '(제목 없음)',
      seriesTitle: nullify(doc.SERIES_TITLE),
      author: nullify(doc.AUTHOR),
      publisher: nullify(doc.PUBLISHER),
      publishDate: parseSeojiDate(doc.PUBLISH_PREDATE),
      page: parsePage(doc.PAGE),
      kdc: nullify(doc.KDC),
      subject: nullify(doc.SUBJECT),
      coverUrl: nullify(doc.TITLE_URL),
      introductionUrl: nullify(doc.BOOK_INTRODUCTION_URL),
      tocUrl: nullify(doc.BOOK_TB_CNT_URL),
      fetchedAt: new Date(),
    };

    return this.prisma.bookWork.upsert({
      where: { isbn13 },
      create: data,
      update: data,
    });
  }

  private async request(
    params: Record<string, string | number>,
  ): Promise<SeojiDoc[]> {
    let data: SeojiResponse;
    try {
      const res = await this.http.get<SeojiResponse>(SEARCH_PATH, {
        params: {
          cert_key: this.certKey,
          result_style: 'json',
          page_no: 1,
          ...params,
        },
      });
      data = res.data;
    } catch (error) {
      this.logger.error(`SEOJI 요청 실패: ${String(error)}`);
      throw this.unavailable();
    }

    // SEOJI는 인증 실패나 파라미터 오류도 HTTP 200 + 본문 에러코드로 돌려준다.
    // status만 보면 그대로 통과해 빈 결과처럼 보이므로 여기서 반드시 걸러낸다.
    if (data?.RESULT === 'ERROR') {
      this.logger.error(
        `SEOJI 오류 ${data.ERR_CODE ?? '?'}: ${data.ERR_MESSAGE ?? ''}`,
      );
      throw this.unavailable();
    }

    // 응답 형식이 바뀌면 조용히 0건이 되는 대신 시끄럽게 실패시킨다
    if (!Array.isArray(data?.docs)) {
      this.logger.error(
        `SEOJI 응답 형식이 예상과 다릅니다: ${JSON.stringify(data).slice(0, 300)}`,
      );
      throw this.unavailable();
    }

    return data.docs;
  }

  private unavailable(): ServiceUnavailableException {
    return new ServiceUnavailableException(
      '도서 정보를 가져오지 못했습니다. 잠시 후 다시 시도해주세요',
    );
  }

  private rememberSearch(query: string, items: SeojiBookSearchItemDto[]): void {
    if (this.searchCache.size >= SEARCH_CACHE_MAX) {
      const oldest = this.searchCache.keys().next().value;
      if (oldest !== undefined) this.searchCache.delete(oldest);
    }
    this.searchCache.set(query, { at: Date.now(), items });
  }

  private assertConfigured(): void {
    if (!this.isConfigured) {
      throw new ServiceUnavailableException(
        '도서 검색이 설정되지 않았습니다 (SEOJI_CERT_KEY 없음)',
      );
    }
  }
}

export function toBookWorkDto(work: BookWork | null): BookWorkDto | null {
  if (!work) return null;
  return {
    isbn13: work.isbn13,
    setIsbn: work.setIsbn,
    title: work.title,
    seriesTitle: work.seriesTitle,
    author: work.author,
    publisher: work.publisher,
    publishDate: work.publishDate ? toDateOnly(work.publishDate) : null,
    page: work.page,
    kdc: work.kdc,
    subject: work.subject,
    coverUrl: work.coverUrl,
    introductionUrl: work.introductionUrl,
    tocUrl: work.tocUrl,
  };
}

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** 빈 문자열로 오는 미입력 값을 null로 통일한다 */
function nullify(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** 하이픈이 섞여 오는 경우가 있어 숫자만 남기고 13자리인지 본다 */
function normalizeIsbn(raw: string | undefined | null): string | null {
  const digits = (raw ?? '').replace(/[^0-9]/g, '');
  return digits.length === 13 ? digits : null;
}

/** "20240315" → Date. 형식이 다르거나 실재하지 않는 날짜면 null */
function parseSeojiDate(raw: string | undefined): Date | null {
  const s = raw?.trim() ?? '';
  if (!/^\d{8}$/.test(s)) return null;
  const d = new Date(
    `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T00:00:00.000Z`,
  );
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseYear(raw: string | undefined): number | null {
  const year = Number(raw?.trim().slice(0, 4));
  return Number.isInteger(year) && year > 1800 ? year : null;
}

/** "372" / "372 p." 처럼 단위가 붙어 오므로 앞쪽 숫자만 취한다 */
function parsePage(raw: string | undefined): number | null {
  const matched = raw?.match(/\d+/);
  const page = matched ? Number(matched[0]) : NaN;
  return Number.isInteger(page) && page > 0 ? page : null;
}
