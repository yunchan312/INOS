import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleApi } from '@/api/endpoints/schedule';
import { Layout } from '@/components/layout/Layout';
import { MeetingStatusBadge } from '@/components/meeting/MeetingStatusBadge';
import { AvailabilityPicker } from '@/components/meeting/AvailabilityPicker';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function MeetingDetailPage() {
  const { groupId, meetingId } = useParams<{ groupId: string; meetingId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: meeting, isLoading } = useQuery({
    queryKey: ['groups', groupId, 'meetings', meetingId],
    queryFn: () => scheduleApi.getMeeting(groupId!, meetingId!).then((r) => r.data),
  });

  const { mutate: submitAvailability, isPending } = useMutation({
    mutationFn: (dates: string[]) =>
      scheduleApi.submitAvailability(groupId!, meetingId!, { availableDates: dates }),
    onSuccess: () =>
      void qc.invalidateQueries({
        queryKey: ['groups', groupId, 'meetings', meetingId],
      }),
  });

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!meeting) return null;

  return (
    <Layout>
      <div className="container max-w-lg mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm btn-circle">
            ←
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold">모임 일정</h2>
            <MeetingStatusBadge status={meeting.status} />
          </div>
        </div>

        {meeting.confirmedDate && (
          <div className="alert alert-success">
            <span>
              확정 일자:{' '}
              {new Date(meeting.confirmedDate).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        )}

        {meeting.location && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <p className="text-sm text-base-content/60">장소</p>
              <p className="font-medium">{meeting.location}</p>
            </div>
          </div>
        )}

        {meeting.status === 'PENDING' && (
          <div>
            <h3 className="font-semibold mb-3">가능한 날짜 입력</h3>
            <AvailabilityPicker
              onSubmit={(dates) => submitAvailability(dates)}
              isLoading={isPending}
            />
          </div>
        )}

        {meeting.status === 'CONFIRMED' && (
          <Link
            to={`/groups/${groupId}/meetings/${meetingId}/discussion`}
            className="btn btn-primary w-full"
          >
            발제문 생성하기
          </Link>
        )}
      </div>
    </Layout>
  );
}
