import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { MeetingDto } from '@inos/types';
import { useAuth } from '@/hooks/useAuth';
import { useMeeting } from '@/hooks/useMeeting';
import { useOrg } from '@/hooks/useOrg';
import { useSubmitAvailability } from '@/hooks/useSubmitAvailability';
import { useUpdateMeeting } from '@/hooks/useUpdateMeeting';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { SectionLabel } from '@/components/SectionLabel';
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar';
import { TimePicker } from '@/components/TimePicker';

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

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

function formatWithWeekday(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const day = WEEKDAY_KO[new Date(y, m - 1, d).getDay()];
  return `${m}월 ${d}일 (${day})`;
}

// 확정된 모임의 날짜/시간 변경 — 리더 전용 (변경 시 서버가 리마인더를 새 시각으로 재예약)
function OwnerReschedule({ orgId, meeting }: { orgId: string; meeting: MeetingDto }) {
  const originalDate = meeting.confirmedDate ? isoDate(meeting.confirmedDate) : '';
  const [date, setDate] = useState(originalDate);
  const [time, setTime] = useState<string | null>(meeting.confirmedTime);
  const updateMeeting = useUpdateMeeting(orgId, meeting.id);

  const unchanged = date === originalDate && time === meeting.confirmedTime;

  return (
    <div className="mt-6 border-2 border-ink bg-paper p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
        리더 · 날짜/시간 변경
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-3">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted mb-1.5">
            모임 날짜
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-underline text-sm"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted mb-1.5">
            모임 시간
          </label>
          <TimePicker value={time} onChange={setTime} />
        </div>
        <Button
          variant="primary"
          size="sm"
          loading={updateMeeting.isPending}
          disabled={!date || unchanged}
          onClick={() =>
            updateMeeting.mutate({
              confirmedDate: date !== originalDate ? date : undefined,
              confirmedTime: time !== meeting.confirmedTime ? time : undefined,
            })
          }
        >
          변경 저장
        </Button>
      </div>
      {updateMeeting.isSuccess && unchanged && (
        <p className="mt-2 text-xs text-muted">
          변경됐어요. 멤버 리마인더도 새 시각으로 재예약돼요.
        </p>
      )}
      {updateMeeting.isError && (
        <p className="mt-2 text-xs text-danger">변경에 실패했어요. 다시 시도해주세요.</p>
      )}
    </div>
  );
}

export default function AvailabilityPage() {
  const { orgId, meetingId } = useParams<{ orgId: string; meetingId: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const meetingQuery = useMeeting(orgId, meetingId);
  const submitMutation = useSubmitAvailability(orgId, meetingId);
  const orgQuery = useOrg(orgId);
  const isOwner = orgQuery.data?.myRole === 'OWNER';
  const updateMeeting = useUpdateMeeting(orgId, meetingId as string);

  const [selected, setSelected] = useState<string[]>([]);
  const [timeNote, setTimeNote] = useState('');
  const [focusedDate, setFocusedDate] = useState<string | null>(null);
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
    if (meetingQuery.data?.myTimeNote) {
      setTimeNote(meetingQuery.data.myTimeNote);
    }
  }, [meetingQuery.data?.myAvailability, meetingQuery.data?.myTimeNote]);

  const meeting = meetingQuery.data;

  // 다른 멤버의 제출 응답 + 내 실시간 선택으로 히트맵 구성
  const othersResponses = useMemo(
    () => (meeting?.responses ?? []).filter((r) => r.userId !== user?.id),
    [meeting?.responses, user?.id],
  );
  const waiting = (meeting?.nonResponders ?? []).filter(
    (n) => n.userId !== user?.id,
  );
  const totalMembers = meeting?.totalMembers ?? 0;

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of othersResponses) {
      for (const d of r.availableDates) map[d] = (map[d] ?? 0) + 1;
    }
    for (const d of selected) map[d] = (map[d] ?? 0) + 1;
    return map;
  }, [othersResponses, selected]);

  // WhenSee식 추천: 최다 겹침 날짜
  const best = useMemo(() => {
    let bestCount = 0;
    let bestDates: string[] = [];
    for (const [d, c] of Object.entries(counts)) {
      if (c > bestCount) {
        bestCount = c;
        bestDates = [d];
      } else if (c === bestCount) {
        bestDates.push(d);
      }
    }
    bestDates.sort();
    return { count: bestCount, dates: bestDates };
  }, [counts]);

  // 상세 조회 중인 날짜의 멤버 구분
  const focusDetail = useMemo(() => {
    if (!focusedDate) return null;
    const availableNames: string[] = [];
    const unavailableNames: string[] = [];
    if (selected.includes(focusedDate)) availableNames.push('나');
    else unavailableNames.push('나');
    for (const r of othersResponses) {
      if (r.availableDates.includes(focusedDate)) availableNames.push(r.nickname);
      else unavailableNames.push(r.nickname);
    }
    return { availableNames, unavailableNames };
  }, [focusedDate, selected, othersResponses]);

  const handleSubmit = () => {
    if (selected.length === 0) return;
    submitMutation.mutate(
      { availableDates: selected, timeNote: timeNote.trim() || null },
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
              일정 조율 · {meeting.respondedCount}/{meeting.totalMembers} 참여
            </p>
            <h1 className="mt-2.5 text-[clamp(28px,5vw,44px)] font-extrabold leading-[1.15] tracking-tight">
              가능한 날짜를
              <br />
              칠해주세요
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
              <>
                <div className="mt-8 border-2 border-ink bg-surface">
                  <EmptyState
                    title="이미 확정된 모임이에요"
                    description={
                      meeting.confirmedDate
                        ? `${formatKorean(isoDate(meeting.confirmedDate))}${
                            meeting.confirmedTime ? ` ${meeting.confirmedTime}` : ''
                          }에 열려요`
                        : undefined
                    }
                    action={
                      <Button variant="ghost" onClick={() => navigate(`/orgs/${orgId}`)}>
                        오가니제이션으로
                      </Button>
                    }
                  />
                </div>
                {isOwner && meeting.status === 'CONFIRMED' && orgId && (
                  <OwnerReschedule orgId={orgId} meeting={meeting} />
                )}
              </>
            ) : (
              <>
                {/* WhenSee식 추천 배너 */}
                {best.count > 0 && (
                  <div
                    className={[
                      'mt-6 border-2 border-ink px-4 py-3 text-sm font-semibold',
                      best.count === totalMembers
                        ? 'bg-point text-on-accent'
                        : 'bg-surface',
                    ].join(' ')}
                  >
                    {best.count === totalMembers ? (
                      <>
                        날짜 맞춰졌어요! {best.dates.map(formatWithWeekday).join(' · ')}{' '}
                        — {totalMembers}명 모두 가능
                      </>
                    ) : (
                      <>
                        추천: {formatWithWeekday(best.dates[0])}
                        {best.dates.length > 1 && ` 외 ${best.dates.length - 1}일`}{' '}
                        <span className="font-normal text-muted">
                          · {best.count}/{totalMembers}명 가능
                        </span>
                      </>
                    )}
                  </div>
                )}

                <section className="mt-8">
                  <SectionLabel num="01" hint="드래그로 칠하고, 다시 드래그하면 지워져요">
                    내 가능 날짜
                  </SectionLabel>
                  <AvailabilityCalendar
                    mode="paint"
                    minDate={isoDate(meeting.candidateFrom)}
                    maxDate={isoDate(meeting.candidateTo)}
                    value={selected}
                    onChange={setSelected}
                  />
                  <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-[13px] font-semibold">
                      선택한 날짜{' '}
                      <span className="bg-point px-2 py-0.5 text-on-accent">
                        {selected.length}개
                      </span>
                    </p>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-baseline justify-between gap-2">
                      <label
                        htmlFor="time-note"
                        className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted"
                      >
                        선호 시간 (선택)
                      </label>
                      <span className="text-[11px] text-muted">
                        {timeNote.length}/80
                      </span>
                    </div>
                    <input
                      id="time-note"
                      type="text"
                      value={timeNote}
                      onChange={(e) => setTimeNote(e.target.value.slice(0, 80))}
                      maxLength={80}
                      placeholder="예: 평일은 저녁 7시 이후, 주말은 아무 때나"
                      className="input-underline mt-1.5 text-[15px]"
                    />
                  </div>

                  {isOwner && (
                    <div className="mt-5 border-2 border-ink bg-surface p-4">
                      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                            모임 시간 · 리더 설정 (선택)
                          </p>
                          <p className="mt-1 text-xs text-muted max-w-[36ch] break-keep">
                            날짜가 확정될 때 이 시간으로 함께 안내돼요. 고르는 즉시
                            저장됩니다.
                          </p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <TimePicker
                            value={meeting.confirmedTime}
                            onChange={(v) => updateMeeting.mutate({ confirmedTime: v })}
                            disabled={updateMeeting.isPending}
                          />
                          {updateMeeting.isSuccess && (
                            <span className="text-[11px] text-muted">저장됨</span>
                          )}
                        </div>
                      </div>
                      {updateMeeting.isError && (
                        <p className="mt-2 text-xs text-danger">
                          시간 저장에 실패했어요. 다시 시도해주세요.
                        </p>
                      )}
                    </div>
                  )}
                </section>

                <section className="mt-10">
                  <SectionLabel num="02" hint="칠할수록 겹치는 날이 선명해져요">
                    모두의 현황
                  </SectionLabel>
                  <AvailabilityCalendar
                    mode="heatmap"
                    minDate={isoDate(meeting.candidateFrom)}
                    maxDate={isoDate(meeting.candidateTo)}
                    counts={counts}
                    total={totalMembers}
                    focusedDate={focusedDate}
                    onFocusDate={setFocusedDate}
                  />

                  {focusedDate && focusDetail && (
                    <div className="mt-3 border-2 border-ink bg-surface p-4 text-[13px]">
                      <p className="font-bold">{formatWithWeekday(focusedDate)}</p>
                      <p className="mt-1.5">
                        <span className="font-semibold">가능</span>{' '}
                        <span className="text-muted">
                          {focusDetail.availableNames.length > 0
                            ? focusDetail.availableNames.join(', ')
                            : '아직 없음'}
                        </span>
                      </p>
                      {focusDetail.unavailableNames.length > 0 && (
                        <p className="mt-1">
                          <span className="font-semibold">어려움</span>{' '}
                          <span className="text-muted">
                            {focusDetail.unavailableNames.join(', ')}
                          </span>
                        </p>
                      )}
                      {waiting.length > 0 && (
                        <p className="mt-1">
                          <span className="font-semibold">미응답</span>{' '}
                          <span className="text-muted">
                            {waiting.map((w) => w.nickname).join(', ')}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {(othersResponses.length > 0 || waiting.length > 0) && (
                    <div className="mt-5 border-t border-line pt-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                        멤버별 응답
                      </p>
                      <div className="mt-2.5 flex flex-col gap-1.5 text-[13px]">
                        {othersResponses.map((r) => (
                          <p key={r.userId}>
                            <span className="font-semibold">{r.nickname}</span>{' '}
                            <span className="text-muted">
                              {r.availableDates.length}일 가능
                              {r.timeNote && ` · ${r.timeNote}`}
                            </span>
                          </p>
                        ))}
                        {waiting.length > 0 && (
                          <p className="text-muted">
                            아직 응답 안 함 — {waiting.map((w) => w.nickname).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </section>

                {confirmed && !confirmed.date && (
                  <p className="mt-4 text-sm text-muted text-center">
                    {confirmed.responded}/{confirmed.total}명 응답 완료
                  </p>
                )}

                <div className="mt-8">
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
