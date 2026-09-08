import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { ShowcaseBookDto, ShowcaseDto, ShowcaseMovieDto } from '@inos/types';

const ALADIN_URL = 'http://www.aladin.co.kr/ttb/api/ItemList.aspx';
const TMDB_POPULAR_URL = 'https://api.themoviedb.org/3/movie/popular';

const BOOK_COUNT = 10;
const MOVIE_COUNT = 5;

/** 베스트셀러·인기작 목록은 하루 단위로도 거의 안 바뀐다. 랜딩 트래픽을 외부로 흘리지 않는다. */
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 6000;

interface AladinItem {
  title?: string;
  author?: string;
  cover?: string;
}

interface TmdbPopularResult {
  id?: number;
  title?: string;
  original_title?: string;
  release_date?: string;
  poster_path?: string | null;
}

/**
 * 랜딩 페이지가 보여주는 "요즘 인기 작품". 로그인 없이 열리는 화면이라
 * 인증도 DB도 타지 않고, 외부 API가 죽으면 빈 배열을 내려 화면이 폴백을 쓰게 한다.
 */
@Injectable()
export class ShowcaseService {
  private readonly logger = new Logger(ShowcaseService.name);
  private readonly aladinKey: string;
  private readonly aladinCategoryId: string;
  private readonly tmdbKey: string;

  private cache: { at: number; data: ShowcaseDto } | null = null;

  constructor(config: ConfigService) {
    this.aladinKey = config.get<string>('ALADIN_TTB_KEY', '').trim();
    // 비워두면 전체 베스트셀러. 알라딘 국내도서 인문학 카테고리는 656.
    this.aladinCategoryId = config.get<string>('ALADIN_CATEGORY_ID', '').trim();
    this.tmdbKey = config.get<string>('TMDB_API_KEY', '').trim();
  }

  async get(): Promise<ShowcaseDto> {
    if (this.cache && Date.now() - this.cache.at < CACHE_TTL_MS) {
      return this.cache.data;
    }

    const [books, movies] = await Promise.all([
      this.fetchBooks(),
      this.fetchMovies(),
    ]);
    const data: ShowcaseDto = { books, movies };

    // 양쪽 다 실패했다면 캐시에 남기지 않는다 — 6시간 동안 빈 화면이 굳어버린다.
    if (books.length > 0 || movies.length > 0) {
      this.cache = { at: Date.now(), data };
    }
    return data;
  }

  /** 알라딘 베스트셀러 상위 10권 */
  private async fetchBooks(): Promise<ShowcaseBookDto[]> {
    if (!this.aladinKey) return [];
    try {
      const res = await axios.get<{ item?: AladinItem[] }>(ALADIN_URL, {
        timeout: REQUEST_TIMEOUT_MS,
        params: {
          ttbkey: this.aladinKey,
          QueryType: 'Bestseller',
          SearchTarget: 'Book',
          MaxResults: BOOK_COUNT,
          start: 1,
          output: 'js',
          Version: '20131101',
          ...(this.aladinCategoryId
            ? { CategoryId: this.aladinCategoryId }
            : {}),
        },
      });

      return (res.data?.item ?? [])
        .slice(0, BOOK_COUNT)
        .map((item) => ({
          title: stripSeriesSuffix(item.title),
          author: firstAuthor(item.author),
          coverUrl: item.cover?.trim() || null,
        }))
        .filter((b) => b.title.length > 0);
    } catch (error) {
      this.logger.warn(`알라딘 베스트셀러 조회 실패: ${String(error)}`);
      return [];
    }
  }

  /** TMDB 인기 영화 상위 5편 */
  private async fetchMovies(): Promise<ShowcaseMovieDto[]> {
    if (!this.tmdbKey) return [];
    try {
      const res = await axios.get<{ results?: TmdbPopularResult[] }>(
        TMDB_POPULAR_URL,
        {
          timeout: REQUEST_TIMEOUT_MS,
          params: {
            api_key: this.tmdbKey,
            language: 'ko-KR',
            region: 'KR',
            page: 1,
          },
        },
      );

      return (res.data?.results ?? [])
        .filter((r): r is TmdbPopularResult & { id: number } =>
          Number.isInteger(r.id),
        )
        .slice(0, MOVIE_COUNT)
        .map((r) => ({
          tmdbId: r.id,
          title: r.title?.trim() || r.original_title?.trim() || '(제목 없음)',
          releaseYear: parseYear(r.release_date),
          posterPath: r.poster_path ?? null,
        }));
    } catch (error) {
      this.logger.warn(`TMDB 인기 영화 조회 실패: ${String(error)}`);
      return [];
    }
  }
}

/** "데미안 (양장본 100쇄 기념)" 처럼 붙는 판형 꼬리표를 서가 책등에서 걷어낸다 */
function stripSeriesSuffix(raw: string | undefined): string {
  const title = raw?.trim() ?? '';
  const cut = title.split(' - ')[0].replace(/\s*\([^)]*\)\s*$/, '');
  return cut.trim() || title;
}

/** 알라딘 author는 "헤르만 헤세 (지은이), 전영애 (옮긴이)" 형태로 온다 */
function firstAuthor(raw: string | undefined): string | null {
  const first = raw?.split(',')[0]?.replace(/\s*\([^)]*\)\s*/g, '').trim();
  return first || null;
}

function parseYear(releaseDate: string | undefined): number | null {
  const year = Number(releaseDate?.slice(0, 4));
  return Number.isInteger(year) && year > 1800 ? year : null;
}
