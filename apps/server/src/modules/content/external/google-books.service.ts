import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface GoogleBookVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    imageLinks?: {
      thumbnail?: string;
    };
    industryIdentifiers?: { type: string; identifier: string }[];
  };
}

interface GoogleBooksResponse {
  items?: GoogleBookVolume[];
  totalItems: number;
}

export interface GoogleBook {
  externalId: string;
  title: string;
  synopsis: string | null;
  releaseYear: number | null;
  thumbnailUrl: string | null;
  type: 'BOOK';
  creator: string | null;
}

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

const POPULAR_SUBJECTS = [
  '소설',
  '자기계발',
  '역사',
  '에세이',
  '과학',
  '철학',
  '경제',
  '인문',
];

@Injectable()
export class GoogleBooksService {
  private readonly apiKey: string;

  constructor(config: ConfigService) {
    this.apiKey = config.getOrThrow<string>('GOOGLE_BOOKS_API_KEY');
  }

  async searchBooks(query: string, limit = 10): Promise<GoogleBook[]> {
    const response = await axios.get<GoogleBooksResponse>(BASE_URL, {
      params: {
        q: query,
        maxResults: Math.min(limit, 40),
        orderBy: 'relevance',
        langRestrict: 'ko',
        key: this.apiKey,
      },
    });

    return (response.data.items ?? []).map((v) => this.toGoogleBook(v));
  }

  async fetchPopularBooks(page: number): Promise<GoogleBook[]> {
    const subject = POPULAR_SUBJECTS[(page - 1) % POPULAR_SUBJECTS.length];
    const startIndex = Math.floor((page - 1) / POPULAR_SUBJECTS.length) * 40;

    const response = await axios.get<GoogleBooksResponse>(BASE_URL, {
      params: {
        q: subject,
        maxResults: 40,
        startIndex,
        orderBy: 'relevance',
        langRestrict: 'ko',
        key: this.apiKey,
      },
    });

    return (response.data.items ?? []).map((v) => this.toGoogleBook(v));
  }

  private toGoogleBook(v: GoogleBookVolume): GoogleBook {
    const info = v.volumeInfo;
    const isbn =
      info.industryIdentifiers?.find((i) => i.type === 'ISBN_13')?.identifier ??
      info.industryIdentifiers?.find((i) => i.type === 'ISBN_10')?.identifier;

    return {
      externalId: isbn ?? v.id,
      title: info.title,
      synopsis: info.description ?? null,
      releaseYear: info.publishedDate ? Number(info.publishedDate.slice(0, 4)) : null,
      thumbnailUrl: info.imageLinks?.thumbnail?.replace('http://', 'https://') ?? null,
      type: 'BOOK' as const,
      creator: info.authors?.join(', ') ?? null,
    };
  }
}
