import type { UserDto } from '@inos/types';
import { apiClient } from '@/api/client';

interface MeResponse {
  user: UserDto;
  isNew: boolean;
}

export const userApi = {
  getMe: () => apiClient.get<MeResponse>('/users/me'),

  updateProfile: (data: { nickname?: string; profileImageUrl?: string }) =>
    apiClient.patch<UserDto>('/users/me', data),
};
