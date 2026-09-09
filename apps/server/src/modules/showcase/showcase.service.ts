import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import type { ShowcaseDto, ShowcaseMovieDto } from '@inos/types';

const TMDB_POPULAR_URL = 'https://api.themoviedb.org/3/movie/popular';

// TMDB popular 한 페이지가 20건이다 — 선반이 가로로 넘치도록 그대로 다 쓴다
const MOVIE_COUNT = 20;

/** 인기작 목록은 하루 단위로도 거의 안 바뀐다. 랜딩 트래픽을 외부로 흘리지 않는다. */
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 6000;

interface TmdbPopularResult {
  id?: number;
  title?: string;
  original_title?: string;
  release_date?: string;
  poster_path?: string | null;
}

/**
 * 랜딩 페이지가 보여주는 "요즘 인기 영화". 로그인 없이 열리는 화면이라
 * 인증도 DB도 타지 않고, TMDB가 죽으면 빈 배열을 내려 화면이 폴백을 쓰게 한다.
 *
 * 서가의 책은 여기서 다루지 않는다 — 무료로 쓸 수 있는 국내 도서 랭킹 API가 없다.
 * SEOJI(국립중앙도서관)는 서지 검색이라 랭킹이 없고 제목 매칭도 헐거워서,
 * 큐레이션 목록을 자동으로 채우면 엉뚱한 책이 꽂힌다. 서가 책은 웹이 직접 들고 있다.
 */
@Injectable()
export class ShowcaseService {
  private readonly logger = new Logger(ShowcaseService.name);
  private readonly tmdbKey: string;

  private cache: { at: number; data: ShowcaseDto } | null = null;

  constructor(config: ConfigService) {
    this.tmdbKey = config.get<string>('TMDB_API_KEY', '').trim();
  }

  async get(): Promise<ShowcaseDto> {
    if (this.cache && Date.now() - this.cache.at < CACHE_TTL_MS) {
      return this.cache.data;
    }

    const movies = await this.fetchMovies();

    // 실패했다면 캐시에 남기지 않는다 — 6시간 동안 빈 화면이 굳어버린다.
    if (movies.length > 0) {
      this.cache = { at: Date.now(), data: { movies } };
    }
    return { movies };
  }

  /** TMDB 인기 영화 상위 20편 */
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

function parseYear(releaseDate: string | undefined): number | null {
  const year = Number(releaseDate?.slice(0, 4));
  return Number.isInteger(year) && year > 1800 ? year : null;
}
