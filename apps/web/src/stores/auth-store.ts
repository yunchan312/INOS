import { create } from 'zustand';
import type { UserDto } from '@inos/types';

const TOKEN_STORAGE_KEY = 'inos.auth.token';
const REFRESH_STORAGE_KEY = 'inos.auth.refresh';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: UserDto | null;
  setToken: (token: string) => void;
  setTokens: (token: string, refreshToken: string) => void;
  setUser: (user: UserDto | null) => void;
  logout: () => void;
}

function readInitial(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
}

export const useAuthStore = create<AuthState>((set) => ({
  token: readInitial(TOKEN_STORAGE_KEY),
  refreshToken: readInitial(REFRESH_STORAGE_KEY),
  user: null,
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
    set({ token });
  },
  setTokens: (token, refreshToken) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      window.localStorage.setItem(REFRESH_STORAGE_KEY, refreshToken);
    }
    set({ token, refreshToken });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(REFRESH_STORAGE_KEY);
    }
    set({ token: null, refreshToken: null, user: null });
  },
}));

export function getAuthToken(): string | null {
  return useAuthStore.getState().token;
}

export function getRefreshToken(): string | null {
  return useAuthStore.getState().refreshToken;
}
