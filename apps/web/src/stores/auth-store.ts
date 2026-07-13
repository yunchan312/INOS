import { create } from 'zustand';
import type { UserDto } from '@inos/types';

const TOKEN_STORAGE_KEY = 'inos.auth.token';

interface AuthState {
  token: string | null;
  user: UserDto | null;
  setToken: (token: string) => void;
  setUser: (user: UserDto | null) => void;
  logout: () => void;
}

function readInitialToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export const useAuthStore = create<AuthState>((set) => ({
  token: readInitialToken(),
  user: null,
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
    set({ token });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    set({ token: null, user: null });
  },
}));

export function getAuthToken(): string | null {
  return useAuthStore.getState().token;
}
