import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface KakaoBookDoc {
  title: string;
  authors: string[];
  contents: string;
  datetime: string;
  thumbnail: string;
  isbn: string;
}

interface KakaoBookResponse {
  documents: KakaoBookDoc[];
}

export interface KakaoBook {
  externalId: string;
  title: string;
  synopsis: string | null;
  releaseYear: number | null;
  thumbnailUrl: string | null;
  type: 'BOOK';
  creator: string | null;
}

@Injectable()
export class KakaoBookService {
  private readonly apiKey: string;

  constructor(config: ConfigService) {
    this.apiKey = config.getOrThrow<string>('KAKAO_REST_API_KEY');
  }

  async searchBooks(query: string, limit = 10): Promise<KakaoBook[]> {
    const response = await axios.get<KakaoBookResponse>(
      'https://dapi.kakao.com/v3/search/book',
      {
        headers: { Authorization: `KakaoAK ${this.apiKey}` },
        params: { query, size: limit },
      },
    );

    return response.data.documents.map((b) => ({
      externalId: b.isbn || `${b.title}-${b.authors.join(',')}`,
      title: b.title,
      synopsis: b.contents || null,
      releaseYear: b.datetime ? Number(b.datetime.slice(0, 4)) : null,
      thumbnailUrl: b.thumbnail || null,
      type: 'BOOK' as const,
      creator: b.authors.join(', ') || null,
    }));
  }
}
