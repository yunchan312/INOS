import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface TmdbMovieResult {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
}

interface TmdbSearchResponse {
  results: TmdbMovieResult[];
}

export interface TmdbMovie {
  externalId: string;
  title: string;
  synopsis: string | null;
  releaseYear: number | null;
  thumbnailUrl: string | null;
  type: 'MOVIE';
  creator: string | null;
}

@Injectable()
export class TmdbService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.themoviedb.org/3';

  constructor(config: ConfigService) {
    this.apiKey = config.getOrThrow<string>('TMDB_API_KEY');
  }

  async searchMovies(query: string, limit = 10): Promise<TmdbMovie[]> {
    const response = await axios.get<TmdbSearchResponse>(`${this.baseUrl}/search/movie`, {
      params: { api_key: this.apiKey, query, language: 'ko-KR', page: 1 },
    });

    return response.data.results.slice(0, limit).map((m) => ({
      externalId: String(m.id),
      title: m.title,
      synopsis: m.overview || null,
      releaseYear: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
      thumbnailUrl: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : null,
      type: 'MOVIE' as const,
      creator: null,
    }));
  }
}
