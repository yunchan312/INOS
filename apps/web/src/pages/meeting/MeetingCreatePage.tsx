import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { scheduleApi } from '@/api/endpoints/schedule';
import { contentApi } from '@/api/endpoints/content';
import { Layout } from '@/components/layout/Layout';

const schema = z.object({
  groupContentId: z.string().min(1, '콘텐츠를 선택해주세요'),
  location: z.string().max(100).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function MeetingCreatePage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const { data: groupContents } = useQuery({
    queryKey: ['groups', groupId, 'contents'],
    queryFn: () => contentApi.getGroupContents(groupId!).then((r) => r.data),
    enabled: !!groupId,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) =>
      scheduleApi.createMeeting(groupId!, {
        groupContentId: data.groupContentId,
        location: data.location,
      }),
    onSuccess: ({ data: meeting }) =>
      navigate(`/groups/${groupId}/meetings/${meeting.id}`, { replace: true }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <Layout>
      <div className="container max-w-lg mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm btn-circle">
            ←
          </button>
          <h2 className="text-xl font-bold">모임 일정 만들기</h2>
        </div>

        <form onSubmit={handleSubmit((v) => mutate(v))} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">함께 볼 콘텐츠 *</span>
            </label>
            <select
              className={`select select-bordered ${errors.groupContentId ? 'select-error' : ''}`}
              {...register('groupContentId')}
            >
              <option value="">선택하세요</option>
              {groupContents?.map((gc) => (
                <option key={gc.id} value={gc.id}>
                  {gc.content?.title ?? gc.contentId}
                </option>
              ))}
            </select>
            {errors.groupContentId && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.groupContentId.message}
                </span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">장소 (선택)</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              placeholder="모임 장소"
              {...register('location')}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
            {isPending ? <span className="loading loading-spinner loading-sm" /> : '일정 만들기'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
