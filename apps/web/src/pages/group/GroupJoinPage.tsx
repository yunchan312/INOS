import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useJoinGroup } from '@/hooks/useGroup';
import { Layout } from '@/components/layout/Layout';

const schema = z.object({
  inviteCode: z.string().min(1, '초대 코드를 입력해주세요'),
});

type FormValues = z.infer<typeof schema>;

export default function GroupJoinPage() {
  const navigate = useNavigate();
  const { mutate, isPending, error } = useJoinGroup();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = ({ inviteCode }: FormValues) => {
    mutate(inviteCode, {
      onSuccess: (member) =>
        navigate(`/groups/${member.groupId}`, { replace: true }),
    });
  };

  return (
    <Layout>
      <div className="container max-w-lg mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm btn-circle">
            ←
          </button>
          <h2 className="text-xl font-bold">모임 참여</h2>
        </div>

        <p className="text-base-content/60 text-sm">
          모임장에게 받은 초대 코드를 입력하세요
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">초대 코드</span>
            </label>
            <input
              type="text"
              className={`input input-bordered ${errors.inviteCode ? 'input-error' : ''}`}
              placeholder="초대 코드 입력"
              {...register('inviteCode')}
            />
            {errors.inviteCode && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.inviteCode.message}
                </span>
              </label>
            )}
            {error && (
              <label className="label">
                <span className="label-text-alt text-error">
                  유효하지 않은 초대 코드입니다
                </span>
              </label>
            )}
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
            {isPending ? <span className="loading loading-spinner loading-sm" /> : '참여하기'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
