import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const AI_BASE_URL = import.meta.env.VITE_AI_API_URL ?? '/ai';

export const aiClient = axios.create({
  baseURL: AI_BASE_URL,
  withCredentials: false,
});

aiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
