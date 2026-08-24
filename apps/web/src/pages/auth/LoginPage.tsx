import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { authApi } from '@/api/endpoints/auth';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth-store';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';

const RETURN_TO_KEY = 'inos.auth.returnTo';

function errorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: string | string[] })
      ?.message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (typeof message === 'string') return message;
  }
  return fallback;
}

const inputClass =
  'w-full box-border border-2 border-ink bg-surface px-3.5 py-3 text-[15px] outline-none focus:border-point-hover';

// 구글 브랜드 마크 (흰 배경 위 4색 G)
function GoogleMark() {
  return (
    <span className="flex h-6 w-6 items-center justify-center bg-white">
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46a5.5 5.5 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.8Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.1A12 12 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.26a12 12 0 0 0 0 10.76l4.01-3.1Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.18 15.24 0 12 0A12 12 0 0 0 1.26 6.62l4.01 3.1C6.22 6.88 8.87 4.75 12 4.75Z"
        />
      </svg>
    </span>
  );
}

// 로컬(이메일/비밀번호) 로그인·회원가입
export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/orgs', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = () => {
    const apiBase = import.meta.env.VITE_API_URL ?? '/api';
    window.location.href = `${apiBase}/auth/google`;
  };

  const canSubmit =
    !pending &&
    !!email.trim() &&
    password.length >= (mode === 'signup' ? 8 : 1) &&
    (mode === 'login' || !!nickname.trim());

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setPending(true);
    setError(null);
    try {
      const tokens =
        mode === 'login'
          ? await authApi.login({ email: email.trim(), password })
          : await authApi.signup({
              email: email.trim(),
              password,
              nickname: nickname.trim(),
            });

      useAuthStore.getState().setTokens(tokens.token, tokens.refreshToken);

      // 초대 링크 등에서 넘어온 경우 원래 가려던 곳으로 복귀
      const returnTo = window.sessionStorage.getItem(RETURN_TO_KEY) ?? '/orgs';
      window.sessionStorage.removeItem(RETURN_TO_KEY);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(
        errorMessage(
          err,
          mode === 'login'
            ? '로그인에 실패했어요. 다시 시도해주세요.'
            : '가입에 실패했어요. 다시 시도해주세요.',
        ),
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-dvh bg-paper flex flex-col pt-safe">
      <main className="mx-auto w-full max-w-md flex-1 px-6 pt-10 page-enter">
        <Link to="/" className="text-[13px] font-medium text-muted hover:text-ink">
          ← 처음으로
        </Link>

        <div className="mt-8 flex items-baseline gap-2.5">
          <span className="text-xl font-extrabold tracking-tight">INOS</span>
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            인문학의 OS
          </span>
        </div>

        <h1 className="mt-4 text-[clamp(28px,5vw,40px)] font-extrabold leading-[1.15] tracking-tight">
          {mode === 'login' ? '로그인하기' : '시작하기'}
        </h1>

        {/* 가장 간편한 경로 — 구글 로그인을 최상단에 크게 */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mt-7 flex w-full min-h-14 items-center justify-center gap-3 border-2 border-ink bg-point px-5 text-base font-bold text-on-accent cursor-pointer hover:bg-point-hover transition-colors"
        >
          <GoogleMark />
          Google 로 계속하기
        </button>
        <p className="mt-2 text-center text-[11px] text-muted">
          비밀번호 없이 3초 만에 시작해요
        </p>

        {/* 구분선 */}
        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            또는 이메일로
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>

        {/* 탭 */}
        <div className="mt-5 flex border-2 border-ink">
          {(
            [
              ['login', '로그인'],
              ['signup', '회원가입'],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={[
                'flex-1 py-2.5 text-sm font-bold transition-colors',
                mode === m ? 'bg-ink text-paper' : 'text-muted hover:text-ink',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          {mode === 'signup' && (
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                닉네임
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 30))}
                placeholder="모임에서 쓸 이름"
                autoComplete="nickname"
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              비밀번호{mode === 'signup' && ' (8자 이상)'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className={inputClass}
            />
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={pending}
            disabled={!canSubmit}
            type="submit"
          >
            {mode === 'login' ? '로그인' : '가입하고 시작하기'}
          </Button>
        </form>

        <p className="mt-5 text-xs text-muted">
          {mode === 'login'
            ? '계정이 없다면 위 회원가입 탭에서 만들 수 있어요.'
            : '가입해도 초대장이나 초대 링크가 있어야 모임에 들어갈 수 있어요.'}
        </p>
      </main>
      <Footer wide />
    </div>
  );
}
