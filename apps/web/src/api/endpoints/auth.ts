import { apiClient } from '@/api/client';
import type { UserDto } from '@inos/types';

export const authApi = {
  getMe: () => apiClient.get<UserDto>('/auth/me').then((r) => r.data),
};
