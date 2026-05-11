import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { userApi } from '@/api/endpoints/user';
import { useAuthStore } from '@/store/auth.store';
import { Layout } from '@/components/layout/Layout';

const schema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 최소 2자 이상이어야 합니다')
    .max(20, '닉네임은 최대 20자까지 입력 가능합니다'),
});

type FormValues = z.infer<typeof schema>;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, setAuth, accessToken } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nickname: user?.nickname ?? '' },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) => userApi.updateProfile(data),
    onSuccess: ({ data: updatedUser }) => {
      if (accessToken) setAuth(accessToken, updatedUser);
      navigate('/home', { replace: true });
    },
  });

  return (
    <Layout hideNav>
      <div
        className="min-h-dvh flex flex-col items-center justify-center px-6 py-12"
        style={{ backgroundColor: 'oklch(98.2% 0.002 80)' }}
      >
        <div className="w-full max-w-sm space-y-10">
          {/* Header */}
          <div className="space-y-2">
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: "'Noto Serif KR', Georgia, serif", color: 'oklch(18% 0.003 80)' }}
            >
              환영합니다
            </h1>
            <p className="text-sm" style={{ color: 'oklch(47% 0.004 80)' }}>
              INOS에서 사용할 닉네임을 알려주세요
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit((v) => mutate(v))} className="space-y-8">
            <div className="space-y-1 pt-4">
              <label className="block text-xs font-medium" style={{ color: 'oklch(47% 0.004 80)' }}>
                닉네임
              </label>
              <input
                type="text"
                className="input-underline w-full text-base"
                placeholder="2~20자"
                {...register('nickname')}
                style={{ color: 'oklch(18% 0.003 80)' }}
              />
              {errors.nickname && (
                <p className="text-xs mt-1" style={{ color: 'oklch(52% 0.20 18)' }}>
                  {errors.nickname.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full min-h-[52px] rounded-[10px] text-sm font-medium transition-colors duration-150"
              style={
                isPending
                  ? { backgroundColor: 'oklch(92% 0.005 80)', color: 'oklch(70% 0.003 80)' }
                  : { backgroundColor: '#ffdf05', color: 'oklch(18% 0.003 80)' }
              }
              disabled={isPending}
            >
              {isPending
                ? <span className="w-4 h-4 inline-block rounded-full border-2 border-[oklch(60%_0.003_80)] border-t-[oklch(98%_0_0)] animate-spin" />
                : '시작하기'
              }
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
