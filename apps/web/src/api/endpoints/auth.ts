import { apiClient } from '@/api/client';
import type {
  AuthTokensDto,
  LocalLoginDto,
  LocalSignupDto,
  UserDto,
} from '@inos/types';

export const authApi = {
  getMe: () => apiClient.get<UserDto>('/auth/me').then((r) => r.data),

  signup: (dto: LocalSignupDto) =>
    apiClient.post<AuthTokensDto>('/auth/signup', dto).then((r) => r.data),

  login: (dto: LocalLoginDto) =>
    apiClient.post<AuthTokensDto>('/auth/login', dto).then((r) => r.data),
};
