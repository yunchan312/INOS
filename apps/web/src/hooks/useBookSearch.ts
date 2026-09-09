import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { seojiApi, type BookSearchCriteria } from '@/api/endpoints/seoji';
import { useAuthStore } from '@/stores/auth-store';
import { useDebounced } from '@/hooks/useDebounced';

/** 서버는 어느 한 항목이라도 2글자를 넘겨야 검색한다 — 그 전에는 요청조차 보내지 않는다 */
const MIN_FIELD_LENGTH = 2;

/**
 * 제목·저자·출판사로 도서를 찾는다. 같은 제목의 판본이 수백 건씩 잡히기 때문에
 * 저자·출판사는 결과를 좁히는 선택 조건으로 함께 넘긴다.
 */
export function useBookSearch(criteria: BookSearchCriteria, enabled = true) {
  const token = useAuthStore((s) => s.token);

  const title = useDebounced(criteria.title?.trim() ?? '');
  const author = useDebounced(criteria.author?.trim() ?? '');
  const publisher = useDebounced(criteria.publisher?.trim() ?? '');

  const usable = [title, author, publisher].map((v) =>
    v.length >= MIN_FIELD_LENGTH ? v : '',
  );
  const [usableTitle, usableAuthor, usablePublisher] = usable;
  const hasCriteria = usable.some(Boolean);
  const canSearch = enabled && !!token && hasCriteria;

  const result = useQuery({
    queryKey: ['seoji', 'books', usableTitle, usableAuthor, usablePublisher],
    queryFn: () =>
      seojiApi.searchBooks({
        title: usableTitle,
        author: usableAuthor,
        publisher: usablePublisher,
      }),
    enabled: canSearch,
    placeholderData: keepPreviousData,
    // 같은 검색어를 다시 치는 일이 잦아 캐시를 넉넉히 잡는다
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const typed = [criteria.title, criteria.author, criteria.publisher].map(
    (v) => v?.trim() ?? '',
  );
  const settled = [title, author, publisher];

  return {
    ...result,
    /** 무언가 입력했는데 아직 어느 항목도 2글자에 못 미친 상태 */
    isTooShort: typed.some(Boolean) && !typed.some((v) => v.length >= MIN_FIELD_LENGTH),
    /** 디바운스가 아직 따라잡지 못한 구간도 로딩으로 취급 */
    isSearching:
      canSearch &&
      (result.isFetching || typed.some((v, i) => v !== settled[i])),
  };
}
