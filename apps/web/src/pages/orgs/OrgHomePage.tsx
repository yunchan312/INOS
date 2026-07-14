import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { MeetingDto } from '@inos/types';
import { useAuth } from '@/hooks/useAuth';
import { useOrg } from '@/hooks/useOrg';
import { useMeetings } from '@/hooks/useMeetings';
import { useRemoveMember } from '@/hooks/useRemoveMember';
import { useOrgEvents } from '@/hooks/useOrgEvents';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/Card';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { MeetingCard } from '@/components/MeetingCard';

function toIsoDate(source: string | Date): string {
  const d = typeof source === 'string' ? new Date(source) : source;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDate()).padStart(2, '0')}`;
}

interface Sections {
  today: MeetingDto[];
  upcoming: MeetingDto[];
  past: MeetingDto[];
}

function partitionMeetings(meetings: MeetingDto[] | undefined): Sections {
  const today: MeetingDto[] = [];
  const upcoming: MeetingDto[] = [];
  const past: MeetingDto[] = [];
  if (!meetings) return { today, upcoming, past };
  const now = new Date();
  const todayIso = toIsoDate(now);
  for (const m of meetings) {
    if (m.status === 'DONE' || m.status === 'CANCELLED') {
      past.push(m);
      continue;
    }
    if (m.status === 'CONFIRMED' && m.confirmedDate) {
      const iso = toIsoDate(m.confirmedDate);
      if (iso === todayIso) today.push(m);
      else if (new Date(m.confirmedDate) < now) past.push(m);
      else upcoming.push(m);
      continue;
    }
    upcoming.push(m);
  }
  return { today, upcoming, past };
}

function SectionLabel({ num, children }: { num: string; children: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-4">
      <span className="text-xs font-bold uppercase tracking-[0.16em]">{num}</span>
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted whitespace-nowrap">
        {children}
      </h2>
    </div>
  );
}

export default function OrgHomePage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const orgQuery = useOrg(orgId);
  const meetingsQuery = useMeetings(orgId);
  const removeMember = useRemoveMember(orgId);
  useOrgEvents(orgId);

  const handleRemoveMember = (userId: string, nickname: string) => {
    if (window.confirm(`${nickname}님을 오가니제이션에서 퇴장시킬까요?`)) {
      removeMember.mutate(userId);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const isOwner = orgQuery.data?.myRole === 'OWNER';

  const sections = useMemo(
    () => partitionMeetings(meetingsQuery.data),
    [meetingsQuery.data],
  );

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <Header />
      <main className="mx-auto max-w-3xl w-full flex-1 px-6 pt-10 page-enter">
        {orgQuery.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        )}

        {orgQuery.data && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b-2 border-ink">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  오가니제이션
                </p>
                <h1 className="mt-2.5 text-[clamp(30px,5vw,48px)] font-extrabold tracking-tight">
                  {orgQuery.data.name}
                </h1>
                {orgQuery.data.description && (
                  <p className="mt-2 text-sm text-muted">
                    {orgQuery.data.description} · {orgQuery.data.members.length}명
                  </p>
                )}
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  <Link to={`/orgs/${orgId}/meetings/new`}>
                    <Button variant="primary" size="md">
                      <span className="whitespace-nowrap">새 모임 만들기</span>
                      <span aria-hidden="true">＋</span>
                    </Button>
                  </Link>
                  <Link to={`/orgs/${orgId}/settings`}>
                    <Button variant="outline" size="md">
                      설정
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {sections.today.length > 0 && (
              <section className="mt-10">
                <SectionLabel num="01">오늘 모임</SectionLabel>
                <div className="space-y-3">
                  {sections.today.map((m) => (
                    <MeetingCard key={m.id} meeting={m} orgId={orgId as string} />
                  ))}
                </div>
              </section>
            )}

            <section className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel num="02">예정된 모임</SectionLabel>
                {isOwner && (
                  <Link
                    to={`/orgs/${orgId}/meetings/new`}
                    className="text-xs font-semibold text-ink border-b border-ink hover:text-muted-2 hover:border-muted-2"
                  >
                    + 새 모임
                  </Link>
                )}
              </div>
              {meetingsQuery.isLoading ? (
                <Skeleton className="h-24" />
              ) : sections.upcoming.length === 0 ? (
                <Card>
                  <EmptyState
                    title="예정된 모임이 없어요"
                    description={
                      isOwner
                        ? '새 모임을 만들면 멤버들에게 이메일 초대장이 발송돼요.'
                        : '소유자가 새 모임을 만들면 초대장이 이메일로 도착해요.'
                    }
                    action={
                      isOwner ? (
                        <Link to={`/orgs/${orgId}/meetings/new`}>
                          <Button variant="primary">새 모임 만들기</Button>
                        </Link>
                      ) : undefined
                    }
                  />
                </Card>
              ) : (
                <div className="space-y-3">
                  {sections.upcoming.map((m) => (
                    <MeetingCard
                      key={m.id}
                      meeting={m}
                      orgId={orgId as string}
                      canManage={isOwner}
                    />
                  ))}
                </div>
              )}
            </section>

            {sections.past.length > 0 && (
              <section className="mt-10">
                <SectionLabel num="03">지난 모임</SectionLabel>
                <div className="space-y-3">
                  {sections.past.map((m) => (
                    <MeetingCard key={m.id} meeting={m} orgId={orgId as string} />
                  ))}
                </div>
              </section>
            )}

            <section className="mt-10">
              <SectionLabel num="04">{`멤버 · ${orgQuery.data.members.length}`}</SectionLabel>
              <div className="border-t-2 border-ink">
                {orgQuery.data.members.map((m) => (
                  <div
                    key={m.id}
                    className="py-3.5 border-b border-line flex items-center gap-3.5"
                  >
                    {m.profileImageUrl ? (
                      <img
                        src={m.profileImageUrl}
                        alt={m.nickname}
                        className="w-[34px] h-[34px] object-cover border-2 border-ink shrink-0"
                      />
                    ) : (
                      <div className="w-[34px] h-[34px] bg-ink text-point flex items-center justify-center text-[13px] font-bold shrink-0">
                        {m.nickname[0]}
                      </div>
                    )}
                    <span className="flex-1 text-sm font-medium">
                      {m.nickname}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted whitespace-nowrap">
                      {m.role === 'OWNER' ? '소유자' : '멤버'}
                    </span>
                    {isOwner && m.role !== 'OWNER' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.userId, m.nickname)}
                        disabled={removeMember.isPending}
                        className="text-xs font-medium text-danger border-b border-danger hover:text-danger-2 hover:border-danger-2 disabled:opacity-50"
                      >
                        퇴장
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
