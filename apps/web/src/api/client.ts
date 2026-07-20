import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { AuthTokensDto } from '@inos/types';
import {
  getAuthToken,
  getRefreshToken,
  useAuthStore,
} from '@/stores/auth-store';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// 동시 다발 401에서 갱신 요청이 한 번만 나가도록 단일 비행으로 묶는다
let refreshPromise: Promise<string | null> | null = null;

async function refreshTokens(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    // apiClient 인터셉터(401 재시도)를 타지 않도록 순정 axios 사용
    const res = await axios.post<AuthTokensDto>(`${BASE_URL}/auth/refresh`, {
      refreshToken,
    });
    useAuthStore.getState().setTokens(res.data.token, res.data.refreshToken);
    return res.data.token;
  } catch {
    return null;
  }
}

apiClient.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as RetriableConfig | undefined;
    if (err.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      refreshPromise ??= refreshTokens().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (newToken) {
        // 요청 인터셉터가 새 토큰을 다시 붙이므로 그대로 재시도
        return apiClient(original);
      }
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  },
);
