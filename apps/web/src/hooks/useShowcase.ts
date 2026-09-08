import { useQuery } from '@tanstack/react-query';
import type { ShowcaseDto } from '@inos/types';
import { showcaseApi } from '@/api/endpoints/showcase';
import { FALLBACK_SHOWCASE } from '@/pages/home/showcaseFallback';

/** 랜딩은 서버 없이도 떠야 한다 — 캐시는 길게, 재시도는 한 번만. */
const STALE_TIME_MS = 30 * 60 * 1000;

/**
 * 인기 도서 10 · 인기 영화 5.
 * 요청이 실패했거나 서버가 빈 목록을 내려도(외부 API 키 없음 등)
 * 큐레이션된 폴백으로 서가를 채운다. 랜딩에 빈 선반을 보이지 않는다.
 */
export function useShowcase(): {
  data: ShowcaseDto;
  isBookFallback: boolean;
  isMovieFallback: boolean;
} {
  const { data } = useQuery({
    queryKey: ['showcase'],
    queryFn: showcaseApi.get,
    staleTime: STALE_TIME_MS,
    gcTime: STALE_TIME_MS,
    retry: 1,
  });

  const books = data?.books?.length ? data.books : FALLBACK_SHOWCASE.books;
  const movies = data?.movies?.length ? data.movies : FALLBACK_SHOWCASE.movies;

  // 책만 받아오고 영화는 실패하는 경우가 있어 두 갈래를 따로 표시한다
  return {
    data: { books, movies },
    isBookFallback: books === FALLBACK_SHOWCASE.books,
    isMovieFallback: movies === FALLBACK_SHOWCASE.movies,
  };
}
