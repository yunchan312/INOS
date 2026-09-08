import { apiClient } from '@/api/client';
import type { TmdbMovieSearchItemDto } from '@inos/types';

export const tmdbApi = {
  searchMovies: (q: string) =>
    apiClient
      .get<TmdbMovieSearchItemDto[]>('/tmdb/movies/search', { params: { q } })
      .then((r) => r.data),
};
