import { apiClient } from '@/api/client';

export const authApi = {
  refresh: () =>
    apiClient.post<{ accessToken: string }>('/auth/refresh'),

  logout: () =>
    apiClient.post('/auth/logout'),

  getGoogleOAuthUrl: () => {
    const base = import.meta.env.VITE_API_URL ?? '/api';
    return `${base}/auth/google`;
  },
};
