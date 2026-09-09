import { apiClient } from '@/api/client';
import type { SeojiBookSearchItemDto } from '@inos/types';

export const seojiApi = {
  searchBooks: (q: string) =>
    apiClient
      .get<SeojiBookSearchItemDto[]>('/seoji/books/search', { params: { q } })
      .then((r) => r.data),
};
