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
          이메일로
          <br />
          {mode === 'login' ? '로그인하기' : '시작하기'}
        </h1>

        {/* 탭 */}
        <div className="mt-7 flex border-2 border-ink">
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
          구글 계정이 있다면 처음 화면의{' '}
          <Link to="/" className="font-semibold text-ink border-b border-ink">
            Google 로 계속하기
          </Link>
          가 더 간편해요.
        </p>
      </main>
      <Footer wide />
    </div>
  );
}
