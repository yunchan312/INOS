import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMeeting } from '@/hooks/useMeeting';
import { useSubmitAvailability } from '@/hooks/useSubmitAvailability';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { When2meetGrid } from '@/components/When2meetGrid';

const RETURN_TO_KEY = 'inos.auth.returnTo';

function isoDate(source: string | Date): string {
  const d = typeof source === 'string' ? new Date(source) : source;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatKorean(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${y}.${m}.${d}`;
}

export default function AvailabilityPage() {
  const { orgId, meetingId } = useParams<{ orgId: string; meetingId: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const meetingQuery = useMeeting(orgId, meetingId);
  const submitMutation = useSubmitAvailability(orgId, meetingId);

  const [selected, setSelected] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState<{
    date: string | null;
    responded: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated && orgId && meetingId) {
      window.sessionStorage.setItem(
        RETURN_TO_KEY,
        `/orgs/${orgId}/meetings/${meetingId}/availability`,
      );
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, orgId, meetingId, navigate]);

  useEffect(() => {
    if (meetingQuery.data?.myAvailability) {
      setSelected(meetingQuery.data.myAvailability);
    }
  }, [meetingQuery.data?.myAvailability]);

  const meeting = meetingQuery.data;

  const handleSubmit = () => {
    if (selected.length === 0) return;
    submitMutation.mutate(
      { availableDates: selected },
      {
        onSuccess: (data) => {
          setConfirmed({
            date: data.confirmedDate
              ? isoDate(new Date(data.confirmedDate))
              : null,
            responded: data.respondedCount,
            total: data.totalMembers,
          });
          // 제출 결과를 잠깐 보여준 뒤 오가니제이션 홈으로 이동
          setTimeout(() => navigate(`/orgs/${orgId}`), data.confirmed ? 1800 : 1200);
        },
      },
    );
  };

  return (
    <div className="min-h-dvh bg-neutral-50">
      <Header />
      <main className="mx-auto max-w-lg px-4 pt-6 pb-safe page-enter">
        {meetingQuery.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-24" />
          </div>
        )}

        {meetingQuery.isError && (
          <EmptyState
            title="모임을 찾을 수 없어요"
            action={
              <Button variant="ghost" onClick={() => navigate('/orgs')}>
                오가니제이션으로
              </Button>
            }
          />
        )}

        {meeting && (
          <>
            <Link
              to={`/orgs/${orgId}`}
              className="text-sm text-neutral-500 hover:text-neutral-800"
            >
              ← 오가니제이션으로
            </Link>

            <h1 className="mt-3 text-2xl font-semibold text-neutral-900">
              가능한 날짜를 선택해주세요
            </h1>

            <div className="mt-4 space-y-1 text-sm text-neutral-500">
              {meeting.bookTitle && (
                <p>📖 {meeting.bookTitle} — {meeting.bookAuthor}</p>
              )}
              {meeting.movieTitle && (
                <p>🎬 {meeting.movieTitle} — {meeting.movieDirector} 감독</p>
              )}
              <p className="mt-2">
                후보 기간: {formatKorean(isoDate(meeting.candidateFrom))} ~{' '}
                {formatKorean(isoDate(meeting.candidateTo))}
              </p>
            </div>

            {confirmed?.date ? (
              <Card className="mt-6">
                <div className="text-center py-6">
                  <p className="text-xs text-neutral-500">확정된 모임 날짜</p>
                  <p className="mt-2 text-3xl font-semibold text-neutral-900">
                    {formatKorean(confirmed.date)}
                  </p>
                  <p className="mt-3 text-sm text-neutral-500">
                    잠시 후 오가니제이션으로 이동해요…
                  </p>
                </div>
              </Card>
            ) : meeting.status !== 'PENDING' ? (
              <Card className="mt-6">
                <EmptyState
                  title="이미 확정된 모임이에요"
                  description={
                    meeting.confirmedDate
                      ? `${formatKorean(isoDate(meeting.confirmedDate))}에 열려요`
                      : undefined
                  }
                  action={
                    <Button variant="ghost" onClick={() => navigate(`/orgs/${orgId}`)}>
                      오가니제이션으로
                    </Button>
                  }
                />
              </Card>
            ) : (
              <>
                <Card className="mt-6">
                  <When2meetGrid
                    value={selected}
                    onChange={setSelected}
                    minDate={isoDate(meeting.candidateFrom)}
                    maxDate={isoDate(meeting.candidateTo)}
                  />
                </Card>

                {confirmed && !confirmed.date && (
                  <p className="mt-4 text-sm text-neutral-500 text-center">
                    {confirmed.responded}/{confirmed.total}명 응답 완료
                  </p>
                )}

                <div className="mt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={submitMutation.isPending}
                    disabled={selected.length === 0}
                    onClick={handleSubmit}
                  >
                    응답 제출
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
