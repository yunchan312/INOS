import { useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  return { token, user, isAuthenticated: !!token, setToken, setUser, logout };
}
