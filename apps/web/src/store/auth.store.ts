import { create } from 'zustand';
import type { UserDto } from '@inos/types';

interface AuthStore {
  accessToken: string | null;
  user: UserDto | null;
  setAuth: (token: string, user: UserDto) => void;
  clearAuth: () => void;
}

const SESSION_KEY = 'inos_user';

function loadUserFromSession(): UserDto | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as UserDto) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  user: loadUserFromSession(),
  setAuth: (token, user) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    set({ accessToken: token, user });
  },
  clearAuth: () => {
    sessionStorage.removeItem(SESSION_KEY);
    set({ accessToken: null, user: null });
  },
}));
