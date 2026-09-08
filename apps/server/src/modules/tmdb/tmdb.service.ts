import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MovieWork } from '@prisma/client';
import axios, { AxiosInstance } from 'axios';
import type { MovieWorkDto, TmdbMovieSearchItemDto } from '@inos/types';
import { PrismaService } from '../../prisma/prisma.service';

const DEFAULT_TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const LANGUAGE = 'ko-KR';
const REGION = 'KR';

/** 검색 결과 중 감독까지 채워서 내려줄 상위 건수 — 결과당 credits 호출이 1회씩 더 나간다 */
const DIRECTOR_LOOKUP_LIMIT = 5;
/** 키 입력 연타로 같은 질의가 반복될 때를 위한 짧은 메모리 캐시 */
const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;
const SEARCH_CACHE_MAX = 100;
/** 저장된 영화 정보를 다시 받아올 주기 (포스터 교체·등급 추가 등을 반영) */
const REFETCH_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

interface TmdbSearchResult {
  id: number;
  title?: string;
  original_title?: string;
  release_date?: string;
  poster_path?: string | null;
  popularity?: number;
}

interface TmdbCrewMember {
  job?: string;
  name?: string;
}

interface TmdbMovieDetail {
  id: number;
  title?: string;
  original_title?: string;
  overview?: string;
  release_date?: string;
  runtime?: number | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  genres?: { id: number; name: string }[];
  credits?: { crew?: TmdbCrewMember[] };
  release_dates?: {
    results?: {
      iso_3166_1?: string;
      release_dates?: { certification?: string }[];
    }[];
  };
}

@Injectable()
export class TmdbService {
  private readonly logger = new Logger(TmdbService.name);
  private readonly apiKey: string;
  private readonly http: AxiosInstance;
  private readonly searchCache = new Map<
    string,
    { at: number; items: TmdbMovieSearchItemDto[] }
  >();

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.apiKey = config.get<string>('TMDB_API_KEY', '').trim();
    // 로컬 검증용으로 다른 엔드포인트를 가리킬 수 있게 열어둔다
    const baseURL = config.get<string>('TMDB_BASE_URL', DEFAULT_TMDB_BASE_URL);
    this.http = axios.create({ baseURL, timeout: 8000 });
  }

  get isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * 영화 제목 자동완성. 감독은 상위 몇 건만 추가 조회해서 채운다 —
   * TMDB 검색 응답 자체에는 감독 정보가 없기 때문.
   */
  async search(rawQuery: string): Promise<TmdbMovieSearchItemDto[]> {
    const query = rawQuery.trim();
    if (query.length < 2) return [];
    this.assertConfigured();

    const cached = this.searchCache.get(query);
    if (cached && Date.now() - cached.at < SEARCH_CACHE_TTL_MS) {
      return cached.items;
    }

    const results = await this.request<{ results?: TmdbSearchResult[] }>(
      '/search/movie',
      { query, language: LANGUAGE, include_adult: false, page: 1 },
    );

    const top = (results.results ?? []).slice(0, DIRECTOR_LOOKUP_LIMIT);
    const items = await Promise.all(
      top.map(async (r) => ({
        tmdbId: r.id,
        title: r.title?.trim() || r.original_title?.trim() || '(제목 없음)',
        originalTitle: r.original_title?.trim() || null,
        director: await this.lookupDirector(r.id),
        releaseYear: parseYear(r.release_date),
        posterPath: r.poster_path ?? null,
      })),
    );

    this.rememberSearch(query, items);
    return items;
  }

  /**
   * tmdbId로 영화를 확정해 movie_works에 적재하고 그 행을 돌려준다.
   * 이미 있고 최근에 받아온 것이면 TMDB를 다시 부르지 않는다 (이 테이블이 곧 캐시).
   */
  async resolveMovieWork(tmdbId: number): Promise<MovieWork> {
    const existing = await this.prisma.movieWork.findUnique({ where: { tmdbId } });
    if (existing && Date.now() - existing.fetchedAt.getTime() < REFETCH_AFTER_MS) {
      return existing;
    }

    this.assertConfigured();
    const detail = await this.fetchDetail(tmdbId);
    const data = {
      tmdbId: detail.id,
      title: detail.title?.trim() || detail.original_title?.trim() || '(제목 없음)',
      originalTitle: detail.original_title?.trim() || null,
      director: pickDirector(detail.credits?.crew),
      releaseDate: parseDate(detail.release_date),
      runtime: detail.runtime ?? null,
      overview: await this.resolveOverview(detail),
      genres: (detail.genres ?? []).map((g) => g.name).filter(Boolean),
      posterPath: detail.poster_path ?? null,
      backdropPath: detail.backdrop_path ?? null,
      certification: pickCertification(detail.release_dates?.results),
      fetchedAt: new Date(),
    };

    return this.prisma.movieWork.upsert({
      where: { tmdbId },
      create: data,
      update: data,
    });
  }

  private async fetchDetail(tmdbId: number): Promise<TmdbMovieDetail> {
    try {
      return await this.request<TmdbMovieDetail>(`/movie/${tmdbId}`, {
        language: LANGUAGE,
        append_to_response: 'credits,release_dates',
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundException('TMDB에서 해당 영화를 찾을 수 없습니다');
      }
      throw error;
    }
  }

  /** 한국어 줄거리가 비어 있는 작품이 흔해서 영어로 한 번 더 시도한다 */
  private async resolveOverview(detail: TmdbMovieDetail): Promise<string | null> {
    const ko = detail.overview?.trim();
    if (ko) return ko;
    try {
      const en = await this.request<TmdbMovieDetail>(`/movie/${detail.id}`, {
        language: 'en-US',
      });
      return en.overview?.trim() || null;
    } catch {
      return null;
    }
  }

  private async lookupDirector(tmdbId: number): Promise<string | null> {
    try {
      const credits = await this.request<{ crew?: TmdbCrewMember[] }>(
        `/movie/${tmdbId}/credits`,
        { language: LANGUAGE },
      );
      return pickDirector(credits.crew);
    } catch (error) {
      // 감독을 못 채워도 검색 자체는 성공시킨다
      this.logger.warn(`감독 조회 실패 (tmdbId=${tmdbId}): ${String(error)}`);
      return null;
    }
  }

  private async request<T>(
    path: string,
    params: Record<string, string | number | boolean>,
  ): Promise<T> {
    try {
      const res = await this.http.get<T>(path, {
        params: { ...params, api_key: this.apiKey, region: REGION },
      });
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) throw error;
      this.logger.error(`TMDB 요청 실패 ${path}: ${String(error)}`);
      throw new ServiceUnavailableException(
        '영화 정보를 가져오지 못했습니다. 잠시 후 다시 시도해주세요',
      );
    }
  }

  private rememberSearch(query: string, items: TmdbMovieSearchItemDto[]): void {
    if (this.searchCache.size >= SEARCH_CACHE_MAX) {
      const oldest = this.searchCache.keys().next().value;
      if (oldest !== undefined) this.searchCache.delete(oldest);
    }
    this.searchCache.set(query, { at: Date.now(), items });
  }

  private assertConfigured(): void {
    if (!this.isConfigured) {
      throw new ServiceUnavailableException(
        '영화 검색이 설정되지 않았습니다 (TMDB_API_KEY 없음)',
      );
    }
  }
}

export function toMovieWorkDto(work: MovieWork | null): MovieWorkDto | null {
  if (!work) return null;
  return {
    tmdbId: work.tmdbId,
    title: work.title,
    originalTitle: work.originalTitle,
    director: work.director,
    releaseDate: work.releaseDate ? toDateOnly(work.releaseDate) : null,
    runtime: work.runtime,
    overview: work.overview,
    genres: work.genres,
    posterPath: work.posterPath,
    backdropPath: work.backdropPath,
    certification: work.certification,
  };
}

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function pickDirector(crew: TmdbCrewMember[] | undefined): string | null {
  const names = (crew ?? [])
    .filter((c) => c.job === 'Director')
    .map((c) => c.name?.trim())
    .filter((n): n is string => !!n);
  return names.length > 0 ? [...new Set(names)].join(', ') : null;
}

function pickCertification(
  results: { iso_3166_1?: string; release_dates?: { certification?: string }[] }[] | undefined,
): string | null {
  const kr = (results ?? []).find((r) => r.iso_3166_1 === REGION);
  const found = (kr?.release_dates ?? [])
    .map((r) => r.certification?.trim())
    .find((c) => !!c);
  return found ?? null;
}

function parseYear(releaseDate: string | undefined): number | null {
  const year = Number(releaseDate?.slice(0, 4));
  return Number.isInteger(year) && year > 1800 ? year : null;
}

function parseDate(releaseDate: string | undefined): Date | null {
  if (!releaseDate || !/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) return null;
  const d = new Date(`${releaseDate}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}
