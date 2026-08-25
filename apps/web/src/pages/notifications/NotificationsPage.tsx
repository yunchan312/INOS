import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NotificationDto, NotificationType } from '@inos/types';
import { useAuth } from '@/hooks/useAuth';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/hooks/useNotifications';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';

const LABELS: Record<NotificationType, { badge: string; title: string }> = {
  DATE_CONFIRMED: { badge: '날짜 확정', title: '모임 날짜가 확정됐어요' },
  DISCUSSION_READY: { badge: '발제문', title: '발제 질문이 도착했어요' },
  MEETING_REMINDER_3H: { badge: '리마인더', title: '곧 모임이 시작돼요' },
  AVAILABILITY_REMINDER: { badge: '일정 응답', title: '가능한 날짜를 선택해주세요' },
};

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return '방금';
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day}일 전`;
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function formatMeetingDate(iso: string, time: string | null): string {
  const d = new Date(iso);
  const base = `${d.getMonth() + 1}월 ${d.getDate()}일`;
  return time ? `${base} ${time}` : base;
}

// 알림 종류에 따라 도착지가 다르다 — 일정 응답만 조율 페이지로
function targetPath(n: NotificationDto): string {
  const base = `/orgs/${n.groupId}/meetings/${n.meetingId}`;
  return n.type === 'AVAILABILITY_REMINDER' ? `${base}/availability` : base;
}

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const notificationsQuery = useNotifications(page);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  useEffect(() => {
    if (!isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const data = notificationsQuery.data;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const handleOpen = (n: NotificationDto) => {
    if (!n.readAt) markRead.mutate(n.id);
    navigate(targetPath(n));
  };

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <Header />
      <main className="mx-auto max-w-3xl w-full flex-1 px-6 pt-10 page-enter">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              알림함
            </p>
            <h1 className="mt-2.5 text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight">
              받은 알림
            </h1>
            {!!data && (
              <p className="mt-2 text-sm text-muted">
                전체 {data.total}개
                {data.unreadCount > 0 && ` · 안 읽음 ${data.unreadCount}개`}
              </p>
            )}
          </div>
          {!!data && data.unreadCount > 0 && (
            <Button
              variant="outline"
              size="md"
              loading={markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              모두 읽음
            </Button>
          )}
        </div>

        {notificationsQuery.isLoading ? (
          <div className="mt-8 space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : !data || data.total === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="아직 받은 알림이 없어요"
              description="날짜가 확정되거나 발제문이 도착하면 여기에 모여요."
            />
          </div>
        ) : (
          <>
            <ul className="mt-2">
              {data.items.map((n) => {
                const label = LABELS[n.type];
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleOpen(n)}
                      className={[
                        'flex w-full items-start gap-3 border-b border-line px-1 py-4 text-left transition-colors hover:bg-surface',
                        n.readAt ? '' : 'bg-point/10',
                      ].join(' ')}
                    >
                      {/* 안 읽음 표시 */}
                      <span
                        aria-hidden="true"
                        className={[
                          'mt-2 h-2 w-2 shrink-0',
                          n.readAt ? 'bg-transparent' : 'bg-point',
                        ].join(' ')}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="border-2 border-ink px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]">
                            {label.badge}
                          </span>
                          <span className="text-[15px] font-bold break-keep">
                            {label.title}
                          </span>
                        </span>
                        <span className="mt-1.5 block text-sm text-muted break-keep">
                          {n.groupName} · {n.workLabel}
                          {n.confirmedDate &&
                            ` · ${formatMeetingDate(n.confirmedDate, n.confirmedTime)}`}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-muted">
                        {formatRelative(n.sentAt)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-end gap-3 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  aria-label="이전 페이지"
                  className="border-2 border-ink px-2 py-0.5 hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ←
                </button>
                <span className="text-muted">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  aria-label="다음 페이지"
                  className="border-2 border-ink px-2 py-0.5 hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
        <div className="pb-12" />
      </main>
      <Footer />
    </div>
  );
}
