import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { userApi } from '@/api/endpoints/user';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    // Temporarily store token to make the API call
    useAuthStore.setState({ accessToken: token });

    userApi
      .getMe()
      .then(({ data }) => {
        setAuth(token, data.user);
        if (data.isNew) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      })
      .catch(() => {
        navigate('/login', { replace: true });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LoadingSpinner fullScreen />;
}
