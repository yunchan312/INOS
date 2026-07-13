import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { MeetingDto } from '@inos/types';
import { useAuth } from '@/hooks/useAuth';
import { useOrg } from '@/hooks/useOrg';
import { useMeetings } from '@/hooks/useMeetings';
import { useRemoveMember } from '@/hooks/useRemoveMember';
import { useOrgEvents } from '@/hooks/useOrgEvents';
import { Header } from '@/components/Header';
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
    <div className="min-h-dvh bg-neutral-50">
      <Header />
      <main className="mx-auto max-w-3xl px-4 pt-6 pb-nav-safe page-enter">
        {orgQuery.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        )}

        {orgQuery.data && (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-neutral-900">
                  {orgQuery.data.name}
                </h1>
                {orgQuery.data.description && (
                  <p className="mt-1 text-sm text-neutral-500">
                    {orgQuery.data.description}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-neutral-500">
                  {orgQuery.data.members.length}명
                </span>
                {isOwner && (
                  <Link
                    to={`/orgs/${orgId}/settings`}
                    className="text-xs text-neutral-500 hover:text-neutral-800"
                  >
                    설정
                  </Link>
                )}
              </div>
            </div>

            {sections.today.length > 0 && (
              <section className="mt-6">
                <h2 className="text-sm font-medium text-neutral-500 mb-2">
                  오늘 모임
                </h2>
                <div className="space-y-2">
                  {sections.today.map((m) => (
                    <MeetingCard key={m.id} meeting={m} orgId={orgId as string} />
                  ))}
                </div>
              </section>
            )}

            <section className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-neutral-500">
                  예정된 모임
                </h2>
                {isOwner && (
                  <Link
                    to={`/orgs/${orgId}/meetings/new`}
                    className="text-xs text-neutral-800 underline underline-offset-2"
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
                <div className="space-y-2">
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
              <section className="mt-8">
                <h2 className="text-sm font-medium text-neutral-500 mb-2">
                  지난 모임
                </h2>
                <div className="space-y-2">
                  {sections.past.map((m) => (
                    <MeetingCard key={m.id} meeting={m} orgId={orgId as string} />
                  ))}
                </div>
              </section>
            )}

            <section className="mt-8">
              <h2 className="text-sm font-medium text-neutral-500 mb-2">멤버</h2>
              <Card>
                <ul className="divide-y divide-neutral-100">
                  {orgQuery.data.members.map((m) => (
                    <li key={m.id} className="py-3 flex items-center gap-3">
                      {m.profileImageUrl ? (
                        <img
                          src={m.profileImageUrl}
                          alt={m.nickname}
                          className="w-9 h-9 rounded-full object-cover border border-neutral-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-sm">
                          {m.nickname[0]}
                        </div>
                      )}
                      <span className="flex-1 text-sm text-neutral-900">
                        {m.nickname}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {m.role === 'OWNER' ? '소유자' : '멤버'}
                      </span>
                      {isOwner && m.role !== 'OWNER' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m.userId, m.nickname)}
                          disabled={removeMember.isPending}
                          className="text-xs text-red-500 hover:text-red-600 underline underline-offset-2 disabled:opacity-50"
                        >
                          퇴장
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
