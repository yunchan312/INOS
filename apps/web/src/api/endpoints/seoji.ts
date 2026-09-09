import { apiClient } from '@/api/client';
import type { SeojiBookSearchItemDto } from '@inos/types';

/** 도서 자동완성 조건. 셋 다 선택이지만 하나는 2글자를 넘겨야 서버가 검색한다. */
export interface BookSearchCriteria {
  title?: string;
  author?: string;
  publisher?: string;
}

export const seojiApi = {
  searchBooks: ({ title, author, publisher }: BookSearchCriteria) =>
    apiClient
      .get<SeojiBookSearchItemDto[]>('/seoji/books/search', {
        // 빈 값은 아예 빼서 쿼리스트링을 지저분하게 만들지 않는다
        params: {
          ...(title ? { q: title } : {}),
          ...(author ? { author } : {}),
          ...(publisher ? { publisher } : {}),
        },
      })
      .then((r) => r.data),
};
