import { apiClient } from '@/api/client';
import type { NotificationListDto } from '@inos/types';

export const notificationApi = {
  list: (page: number) =>
    apiClient
      .get<NotificationListDto>('/notifications', { params: { page } })
      .then((r) => r.data),

  markRead: (notificationId: string) =>
    apiClient.post<void>(`/notifications/${notificationId}/read`),

  markAllRead: () => apiClient.post<void>('/notifications/read-all'),
};
