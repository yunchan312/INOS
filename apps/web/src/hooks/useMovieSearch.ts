import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { tmdbApi } from '@/api/endpoints/tmdb';
import { useAuthStore } from '@/stores/auth-store';

/** 서버는 2글자부터 검색한다 — 그 전에는 요청조차 보내지 않는다 */
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

/** 타이핑이 멎을 때까지 기다렸다가 값을 흘려보낸다 */
function useDebounced(value: string, delay = DEBOUNCE_MS): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useMovieSearch(query: string, enabled = true) {
  const token = useAuthStore((s) => s.token);
  const debounced = useDebounced(query.trim());
  const canSearch = enabled && !!token && debounced.length >= MIN_QUERY_LENGTH;

  const result = useQuery({
    queryKey: ['tmdb', 'movies', debounced],
    queryFn: () => tmdbApi.searchMovies(debounced),
    enabled: canSearch,
    placeholderData: keepPreviousData,
    // 같은 검색어를 다시 치는 일이 잦아 캐시를 넉넉히 잡는다
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return {
    ...result,
    /** 디바운스가 아직 따라잡지 못한 구간도 로딩으로 취급 */
    isSearching:
      canSearch && (result.isFetching || debounced !== query.trim()),
    isTooShort: query.trim().length > 0 && query.trim().length < MIN_QUERY_LENGTH,
  };
}
