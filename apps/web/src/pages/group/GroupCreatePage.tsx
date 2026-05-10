import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateGroup } from '@/hooks/useGroup';
import { Layout } from '@/components/layout/Layout';
import type { GroupMode } from '@inos/types';

const schema = z.object({
  name: z.string().min(2, '모임 이름은 최소 2자 이상이어야 합니다').max(50),
  description: z.string().max(200).optional(),
  mode: z.enum(['GROUP', 'SOLO'] as const),
});

type FormValues = z.infer<typeof schema>;

export default function GroupCreatePage() {
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateGroup();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { mode: 'GROUP' },
  });

  const mode = watch('mode');

  const onSubmit = (data: FormValues) => {
    mutate(
      { ...data, mode: data.mode as GroupMode },
      { onSuccess: (group) => navigate(`/groups/${group.id}`, { replace: true }) },
    );
  };

  return (
    <Layout>
      <div className="container max-w-lg mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-150"
            style={{ color: 'oklch(47% 0.004 80)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'oklch(95.5% 0.003 80)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: "'Noto Serif KR', Georgia, serif", color: 'oklch(18% 0.003 80)' }}
          >
            새 모임 만들기
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Name */}
          <div className="space-y-1 pt-2">
            <label className="block text-xs font-medium" style={{ color: 'oklch(47% 0.004 80)' }}>
              모임 이름 *
            </label>
            <input
              type="text"
              className="input-underline w-full text-base"
              placeholder="모임 이름을 입력하세요"
              {...register('name')}
              style={{ color: 'oklch(18% 0.003 80)', borderBottomColor: errors.name ? 'oklch(52% 0.20 18)' : undefined }}
            />
            {errors.name && (
              <p className="text-xs" style={{ color: 'oklch(52% 0.20 18)' }}>{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-medium" style={{ color: 'oklch(47% 0.004 80)' }}>
              소개 <span style={{ color: 'oklch(70% 0.003 80)' }}>(선택)</span>
            </label>
            <textarea
              className="w-full bg-transparent resize-none text-sm border-b border-[oklch(92%_0.005_80)] focus:border-[oklch(30%_0.13_268)] focus:outline-none transition-colors duration-200 py-2"
              placeholder="모임을 소개해주세요"
              rows={2}
              style={{ color: 'oklch(18% 0.003 80)', fontFamily: "'Pretendard', system-ui, sans-serif" }}
              {...register('description')}
            />
          </div>

          {/* Mode */}
          <div className="space-y-3">
            <label className="block text-xs font-medium" style={{ color: 'oklch(47% 0.004 80)' }}>
              모임 유형
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['GROUP', 'SOLO'] as const).map((m) => (
                <label
                  key={m}
                  className="relative flex flex-col gap-1 p-4 rounded-2xl border cursor-pointer transition-colors duration-150"
                  style={{
                    borderColor: mode === m ? 'oklch(30% 0.13 268)' : 'oklch(92% 0.005 80)',
                    backgroundColor: mode === m ? 'oklch(90% 0.03 268)' : 'oklch(100% 0 0)',
                  }}
                >
                  <input type="radio" value={m} {...register('mode')} className="sr-only" />
                  <p className="font-semibold text-sm" style={{ color: 'oklch(18% 0.003 80)' }}>
                    {m === 'GROUP' ? '그룹' : '개인'}
                  </p>
                  <p className="text-xs" style={{ color: 'oklch(47% 0.004 80)' }}>
                    {m === 'GROUP' ? '여러 명이 함께' : '혼자 기록'}
                  </p>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[52px] rounded-[10px] text-sm font-medium transition-colors duration-150"
            style={
              isPending
                ? { backgroundColor: 'oklch(92% 0.005 80)', color: 'oklch(70% 0.003 80)' }
                : { backgroundColor: 'oklch(30% 0.13 268)', color: 'oklch(98.2% 0.002 80)' }
            }
            disabled={isPending}
          >
            {isPending
              ? <span className="w-4 h-4 inline-block rounded-full border-2 border-[oklch(60%_0.003_80)] border-t-[oklch(98%_0_0)] animate-spin" />
              : '모임 만들기'
            }
          </button>
        </form>
      </div>
    </Layout>
  );
}
