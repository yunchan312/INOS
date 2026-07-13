import axios from 'axios';
import { getAuthToken } from '@/stores/auth-store';

const AI_BASE_URL = import.meta.env.VITE_AI_API_URL ?? '/ai';

export const aiClient = axios.create({
  baseURL: AI_BASE_URL,
  withCredentials: false,
});

aiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

export function buildAiSseUrl(path: string): string {
  const token = getAuthToken();
  const separator = path.includes('?') ? '&' : '?';
  const tokenParam = token ? `${separator}token=${encodeURIComponent(token)}` : '';
  return `${AI_BASE_URL}${path}${tokenParam}`;
}
