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

/** 제목·저자·출판사 중 이 길이를 넘긴 항목만 SEOJI로 보낸다 */
const MIN_FIELD_LENGTH = 2;
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

/** 자동완성 검색 조건. 셋 다 선택이지만 하나는 채워져야 한다 */
export interface SeojiSearchCriteria {
  title?: string;
  author?: string;
  publisher?: string;
}

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
   * 책 자동완성. TMDB와 달리 검색 응답 한 번에 저자·출판사·표지가 모두 담겨
   * 오므로 결과당 추가 조회가 없다.
   *
   * 제목만으로는 같은 작품의 판본이 수백 건씩 잡힌다("데미안" 515건). 저자·출판사를
   * 함께 넘기면 SEOJI가 교집합으로 좁혀준다(+출판사 = 7건). 셋 다 선택 항목이고,
   * 그중 하나만 2글자를 넘겨도 검색한다 — 제목이 기억나지 않을 때가 있다.
   */
  async search(criteria: SeojiSearchCriteria): Promise<SeojiBookSearchItemDto[]> {
    const title = criteria.title?.trim() ?? '';
    const author = criteria.author?.trim() ?? '';
    const publisher = criteria.publisher?.trim() ?? '';

    const longEnough = (v: string) => v.length >= MIN_FIELD_LENGTH;
    if (![title, author, publisher].some(longEnough)) return [];
    this.assertConfigured();

    // 세 항목의 조합이 곧 캐시 키다 — 제목만 같고 저자가 다른 검색이 섞이면 안 된다
    const cacheKey = JSON.stringify([title, author, publisher]);
    const cached = this.searchCache.get(cacheKey);
    if (cached && Date.now() - cached.at < SEARCH_CACHE_TTL_MS) {
      return cached.items;
    }

    const docs = await this.request({
      page_size: SEARCH_FETCH_SIZE,
      // 2글자에 못 미치는 값은 보내지 않는다. SEOJI가 한 글자로도 걸러내긴 하지만
      // 오타 한 글자 때문에 결과가 통째로 비는 편이 더 나쁘다
      ...(longEnough(title) ? { title } : {}),
      ...(longEnough(author) ? { author } : {}),
      ...(longEnough(publisher) ? { publisher } : {}),
    });

    const items: SeojiBookSearchItemDto[] = [];
    const seen = new Set<string>();
    for (const doc of sortByTitleRelevance(docs, title)) {
      // ISBN이 곧 우리 쪽 키다. 없는 행은 확정할 수 없으니 후보에서 뺀다
      const isbn13 = normalizeIsbn(doc.EA_ISBN);
      if (!isbn13 || seen.has(isbn13)) continue;
      seen.add(isbn13);
      items.push({
        isbn13,
        title: nullify(doc.TITLE) ?? '(제목 없음)',
        author: normalizeAuthor(doc.AUTHOR),
        publisher: nullify(doc.PUBLISHER),
        publishYear: parseYear(doc.PUBLISH_PREDATE),
        coverUrl: nullify(doc.TITLE_URL),
      });
      if (items.length >= SEARCH_RESULT_LIMIT) break;
    }

    this.rememberSearch(cacheKey, items);
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
      author: normalizeAuthor(doc.AUTHOR),
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

  private rememberSearch(cacheKey: string, items: SeojiBookSearchItemDto[]): void {
    if (this.searchCache.size >= SEARCH_CACHE_MAX) {
      const oldest = this.searchCache.keys().next().value;
      if (oldest !== undefined) this.searchCache.delete(oldest);
    }
    this.searchCache.set(cacheKey, { at: Date.now(), items });
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
/**
 * SEOJI의 AUTHOR는 역할이 잔뜩 붙은 한 덩어리로 온다. 실측된 형태만 해도
 *   "저자 : 헤르만 헤세;역자 : 이민정;"  "지은이: 헤르만 헤세 ;옮긴이: 김민준"
 *   "아이작 아시모프 지음 ;이강환 옮김"  "알베르 카뮈 [저] ; 김용훈 [역]"
 *   "글 김성훈, 그림 최복기, 감수 오창길"  "글/그림: Ryuhei Tamura ;번역: 김수연"
 *   "Bohra Naono  번역:김명은"           "김정호 지음"
 * 이걸 그대로 두면 자동완성 한 줄에 번역가·삽화가까지 다 나온다.
 * 대표 저자 한 명만 남긴다 — 못 알아보는 형태면 원문을 그대로 돌려준다.
 */
function normalizeAuthor(raw: string | undefined): string | null {
  const original = nullify(raw);
  if (!original) return null;

  let s = original;
  // 1) 역할이 여러 개면 맨 앞(=대표 저자)만 취한다
  s = s.split(/[;；]/)[0];
  s = s.split(/\s+\/\s+/)[0];
  // 2) 맨 앞 역할 라벨을 먼저 뗀다 ("저자 : ", "글쓴이: ", "글/그림: ")
  //    부차 역할 절단보다 앞서야 한다 — "글/그림:"의 "그림:"에 잘리면 "글/"만 남는다
  s = s.replace(/^[^:：]{1,12}[:：]\s*/, '');
  // 3) 구분자 없이 이어 붙는 다른 역할을 잘라낸다 ("Bohra Naono  번역:김명은")
  s = s.split(SECONDARY_ROLE_RE)[0];
  // 4) 콤마로 역할을 나열한 경우 첫 항목만 ("글 김성훈, 그림 최복기")
  s = s.split(',')[0];
  // 5) 대괄호 역할과 앞뒤 역할어를 턴다
  s = s.replace(/\[[^\]]*\]/g, '');
  s = s.replace(/^(?:글|그림|사진|감수)\s+/, '');
  s = s.replace(/\s+(?:지음|엮음|옮김|편저|저술|저|글|역)\s*$/, '');

  return s.trim() || original;
}

/** 앞 사람 이름 뒤에 구분자 없이 붙는 부차 역할 라벨 */
const SECONDARY_ROLE_RE =
  /\s*(?:역자|옮긴이|번역|그림|삽화가?|감수|사진|낭독자|공동연구|편집)\s*[:：]/;

/**
 * SEOJI의 제목 검색은 부분 일치라 "데미안"에 "(알타미라 벽화에서 데미안 허스트까지) 미술법"
 * 같은 것이 상위로 섞여 온다. 제목이 정확히 같은 것 → 검색어로 시작하는 것 순으로 보여준다 —
 * 같은 등급 안에서는 SEOJI가 준 순서를 그대로 둔다.
 */
function sortByTitleRelevance(docs: SeojiDoc[], query: string): SeojiDoc[] {
  const q = query.replace(/\s+/g, '').toLowerCase();
  // 저자·출판사로만 찾는 중이면 견줄 제목이 없다. SEOJI가 준 순서를 그대로 둔다
  if (!q) return docs;
  const rank = (doc: SeojiDoc): number => {
    const title = (doc.TITLE ?? '').replace(/\s+/g, '').toLowerCase();
    if (title === q) return 0;
    if (title.startsWith(q)) return 1;
    if (title.includes(q)) return 2;
    return 3;
  };
  return docs
    .map((doc, i) => ({ doc, i, r: rank(doc) }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map((x) => x.doc);
}

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
