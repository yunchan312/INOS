import { useQuery } from '@tanstack/react-query';
import type { ShowcaseBookDto, ShowcaseMovieDto } from '@inos/types';
import { showcaseApi } from '@/api/endpoints/showcase';
import { FALLBACK_MOVIES, SHELF_BOOKS } from '@/pages/home/showcaseContent';

/** 랜딩은 서버 없이도 떠야 한다 — 캐시는 길게, 재시도는 한 번만. */
const STALE_TIME_MS = 30 * 60 * 1000;

/**
 * 서가 책 10권 · 인기 영화 5편.
 * 책은 서버를 타지 않는 큐레이션 목록이고, 영화만 TMDB에서 받아온다.
 * 요청이 실패했거나 서버가 빈 목록을 내려도(TMDB 키 없음 등) 폴백으로 채운다 —
 * 랜딩에 빈 선반을 보이지 않는다.
 */
export function useShowcase(): {
  books: ShowcaseBookDto[];
  movies: ShowcaseMovieDto[];
  isMovieFallback: boolean;
} {
  const { data } = useQuery({
    queryKey: ['showcase'],
    queryFn: showcaseApi.get,
    staleTime: STALE_TIME_MS,
    gcTime: STALE_TIME_MS,
    retry: 1,
  });

  const movies = data?.movies?.length ? data.movies : FALLBACK_MOVIES;

  return {
    books: SHELF_BOOKS,
    movies,
    isMovieFallback: movies === FALLBACK_MOVIES,
  };
}
