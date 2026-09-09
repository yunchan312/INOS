import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { seojiApi } from '@/api/endpoints/seoji';
import { useAuthStore } from '@/stores/auth-store';
import { useDebounced } from '@/hooks/useDebounced';

/** 서버는 2글자부터 검색한다 — 그 전에는 요청조차 보내지 않는다 */
const MIN_QUERY_LENGTH = 2;

export function useBookSearch(query: string, enabled = true) {
  const token = useAuthStore((s) => s.token);
  const debounced = useDebounced(query.trim());
  const canSearch = enabled && !!token && debounced.length >= MIN_QUERY_LENGTH;

  const result = useQuery({
    queryKey: ['seoji', 'books', debounced],
    queryFn: () => seojiApi.searchBooks(debounced),
    enabled: canSearch,
    placeholderData: keepPreviousData,
    // 같은 검색어를 다시 치는 일이 잦아 캐시를 넉넉히 잡는다
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return {
    ...result,
    /** 디바운스가 아직 따라잡지 못한 구간도 로딩으로 취급 */
    isSearching: canSearch && (result.isFetching || debounced !== query.trim()),
    isTooShort: query.trim().length > 0 && query.trim().length < MIN_QUERY_LENGTH,
  };
}
