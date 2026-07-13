import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/orgs', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = () => {
    const apiBase = import.meta.env.VITE_API_URL ?? '/api';
    window.location.href = `${apiBase}/auth/google`;
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-neutral-50 px-6 pt-safe pb-safe">
      <div className="w-full max-w-sm text-center page-enter">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">INOS</h1>
        <p className="mt-3 text-sm text-neutral-500">
          함께 읽고, 보고, 생각합니다.
        </p>
        <div className="mt-16">
          <Button
            fullWidth
            size="lg"
            variant="primary"
            onClick={handleGoogleLogin}
          >
            Google 로 계속하기
          </Button>
          <p className="mt-4 text-xs text-neutral-400">
            초대받은 오가니제이션에만 접근할 수 있어요.
          </p>
        </div>
      </div>
    </main>
  );
}
