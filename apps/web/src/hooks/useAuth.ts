import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api/endpoints/auth';

export function useAuth() {
  const { accessToken, user, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const isAuthenticated = !!accessToken;

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      navigate('/login', { replace: true });
    }
  }, [clearAuth, navigate]);

  const loginWithGoogle = useCallback(() => {
    window.location.href = authApi.getGoogleOAuthUrl();
  }, []);

  return { isAuthenticated, user, accessToken, setAuth, clearAuth, logout, loginWithGoogle };
}
