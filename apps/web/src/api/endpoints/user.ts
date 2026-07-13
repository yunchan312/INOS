import { apiClient } from '@/api/client';
import type { UpdateUserDto, UserDto } from '@inos/types';

export const userApi = {
  getMe: () => apiClient.get<UserDto>('/users/me').then((r) => r.data),

  updateMe: (dto: UpdateUserDto) =>
    apiClient.patch<UserDto>('/users/me', dto).then((r) => r.data),
};
