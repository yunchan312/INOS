import { apiClient } from '@/api/client';
import type { ShowcaseDto } from '@inos/types';

export const showcaseApi = {
  /** 랜딩 서가에 쓰는 인기 작품 묶음. 로그인 없이 호출한다. */
  get: () => apiClient.get<ShowcaseDto>('/showcase').then((r) => r.data),
};
