import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMeeting } from '@/hooks/useMeeting';
import { useSubmitAvailability } from '@/hooks/useSubmitAvailability';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
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

function formatShort(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${Number(m)}.${Number(d)}`;
}

export default function AvailabilityPage() {
  const { orgId, meetingId } = useParams<{ orgId: string; meetingId: string }>();
  const { isAuthenticated, user } = useAuth();
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

  // 다른 멤버들의 응답 현황 (내 응답 제외)
  const othersResponses = (meeting?.responses ?? []).filter(
    (r) => r.userId !== user?.id,
  );
  const waiting = (meeting?.nonResponders ?? []).filter(
    (n) => n.userId !== user?.id,
  );
  const badges: Record<string, number> = {};
  for (const r of othersResponses) {
    for (const d of r.availableDates) {
      badges[d] = (badges[d] ?? 0) + 1;
    }
  }

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
    <div className="min-h-dvh bg-paper flex flex-col">
      <Header />
      <main className="mx-auto max-w-[640px] w-full flex-1 px-6 pt-10 page-enter">
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
              className="text-[13px] font-medium text-muted hover:text-ink"
            >
              ← 오가니제이션으로
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              일정 조율 · {meeting.respondedCount}/{meeting.totalMembers} 응답
            </p>
            <h1 className="mt-2.5 text-[clamp(28px,5vw,44px)] font-extrabold leading-[1.15] tracking-tight">
              가능한 날짜를
              <br />
              선택해주세요
            </h1>

            <div className="mt-4 pb-6 border-b-2 border-ink">
              <p className="text-[15px] font-semibold">
                {meeting.bookTitle && (
                  <>
                    {meeting.bookTitle}{' '}
                    <span className="font-normal text-muted">
                      — {meeting.bookAuthor} · 책
                    </span>
                  </>
                )}
                {meeting.movieTitle && (
                  <>
                    {meeting.bookTitle && ' · '}
                    {meeting.movieTitle}{' '}
                    <span className="font-normal text-muted">
                      — {meeting.movieDirector} 감독 · 영화
                    </span>
                  </>
                )}
              </p>
              <p className="mt-1.5 text-[13px] text-muted">
                후보 기간 {formatKorean(isoDate(meeting.candidateFrom))} –{' '}
                {formatKorean(isoDate(meeting.candidateTo))} · 전원이 겹치는
                날로 자동 확정돼요
              </p>
            </div>

            {confirmed?.date ? (
              <div className="mt-8 border-2 border-ink bg-surface p-8 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  확정된 모임 날짜
                </p>
                <p className="mt-3 text-3xl font-extrabold">
                  {formatKorean(confirmed.date)}
                </p>
                <p className="mt-3 text-sm text-muted">
                  잠시 후 오가니제이션으로 이동해요…
                </p>
              </div>
            ) : meeting.status !== 'PENDING' ? (
              <div className="mt-8 border-2 border-ink bg-surface">
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
              </div>
            ) : (
              <>
                {(othersResponses.length > 0 || waiting.length > 0) && (
                  <div className="mt-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                      멤버 응답 현황
                    </p>
                    <div className="mt-2.5 flex flex-col gap-1.5 text-[13px]">
                      {othersResponses.map((r) => (
                        <p key={r.userId}>
                          <span className="font-semibold">{r.nickname}</span>{' '}
                          <span className="text-muted">
                            {r.availableDates.map(formatShort).join(' · ')}
                          </span>
                        </p>
                      ))}
                      {waiting.length > 0 && (
                        <p className="text-muted">
                          아직 응답 안 함 —{' '}
                          {waiting.map((w) => w.nickname).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-7">
                  <When2meetGrid
                    value={selected}
                    onChange={setSelected}
                    minDate={isoDate(meeting.candidateFrom)}
                    maxDate={isoDate(meeting.candidateTo)}
                    badges={badges}
                  />
                </div>

                {confirmed && !confirmed.date && (
                  <p className="mt-4 text-sm text-muted text-center">
                    {confirmed.responded}/{confirmed.total}명 응답 완료
                  </p>
                )}

                <div className="mt-7">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={submitMutation.isPending}
                    disabled={selected.length === 0}
                    onClick={handleSubmit}
                  >
                    <span>응답 제출</span>
                    <span aria-hidden="true">→</span>
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
