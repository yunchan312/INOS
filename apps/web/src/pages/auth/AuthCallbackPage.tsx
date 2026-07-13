import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/api/endpoints/auth';
import { useAuthStore } from '@/stores/auth-store';

const RETURN_TO_KEY = 'inos.auth.returnTo';

export default function AuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const token = params.get('token');
    if (!token) {
      navigate('/', { replace: true });
      return;
    }

    const storedReturnTo = window.sessionStorage.getItem(RETURN_TO_KEY);
    const returnTo = params.get('returnTo') ?? storedReturnTo ?? '/orgs';
    window.sessionStorage.removeItem(RETURN_TO_KEY);

    useAuthStore.getState().setToken(token);

    authApi
      .getMe()
      .then((user) => {
        useAuthStore.getState().setUser(user);
        navigate(returnTo, { replace: true });
      })
      .catch(() => {
        useAuthStore.getState().logout();
        navigate('/', { replace: true });
      });
  }, [params, navigate]);

  return (
    <div className="min-h-dvh flex items-center justify-center">
      <span className="loading loading-dots loading-md" />
    </div>
  );
}
