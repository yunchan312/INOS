import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { MeetingDto } from '@inos/types';
import { Card } from './Card';
import { Button } from './Button';
import { useUpdateMeeting } from '@/hooks/useUpdateMeeting';
import { useDeleteMeeting } from '@/hooks/useDeleteMeeting';
import { TimePicker } from './TimePicker';
import { WorkCover } from '@/components/WorkCover';
import {
  MovieSearchInput,
  movieSelectionFromMeeting,
  toMoviePayload,
  type MovieSelection,
} from '@/components/MovieSearchInput';

interface MeetingCardProps {
  meeting: MeetingDto;
  orgId: string;
  canManage?: boolean;
}

function formatKoreanDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}.${String(d.getDate()).padStart(2, '0')}`;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

const inputClass = 'input-underline text-sm';

function toDateInputValue(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDate()).padStart(2, '0')}`;
}

function MeetingEditForm({
  meeting,
  orgId,
  onClose,
}: {
  meeting: MeetingDto;
  orgId: string;
  onClose: () => void;
}) {
  const [bookTitle, setBookTitle] = useState(meeting.bookTitle ?? '');
  const [bookAuthor, setBookAuthor] = useState(meeting.bookAuthor ?? '');
  const [movie, setMovie] = useState<MovieSelection | null>(() =>
    movieSelectionFromMeeting(meeting),
  );
  const [location, setLocation] = useState(meeting.location ?? '');
  const [confirmedDate, setConfirmedDate] = useState(
    meeting.confirmedDate ? toDateInputValue(meeting.confirmedDate) : '',
  );
  const [confirmedTime, setConfirmedTime] = useState<string | null>(
    meeting.confirmedTime,
  );
  const updateMeeting = useUpdateMeeting(orgId, meeting.id);

  // 확정된 모임만 날짜 변경 가능, 후보 기간 내로 제한
  const canEditDate = meeting.status === 'CONFIRMED';
  const originalDate = meeting.confirmedDate
    ? toDateInputValue(meeting.confirmedDate)
    : '';

  const handleSave = () => {
    updateMeeting.mutate(
      {
        bookTitle: bookTitle.trim() || undefined,
        bookAuthor: bookAuthor.trim() || undefined,
        ...toMoviePayload(movie),
        location: location.trim() || undefined,
        confirmedDate:
          canEditDate && confirmedDate && confirmedDate !== originalDate
            ? confirmedDate
            : undefined,
        confirmedTime:
          canEditDate && confirmedTime !== meeting.confirmedTime
            ? confirmedTime
            : undefined,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="mt-4 space-y-3 border-t border-line pt-4">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          placeholder="책 제목"
          className={inputClass}
        />
        <input
          type="text"
          value={bookAuthor}
          onChange={(e) => setBookAuthor(e.target.value)}
          placeholder="저자"
          className={inputClass}
        />
      </div>
      <MovieSearchInput
        value={movie}
        onChange={setMovie}
        variant="boxed"
        label="영화"
        placeholder="영화 제목으로 검색"
      />
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="장소"
        className={inputClass}
      />
      {canEditDate && (
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted mb-1.5">
              모임 날짜
            </label>
            <input
              type="date"
              value={confirmedDate}
              onChange={(e) => setConfirmedDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted mb-1.5">
              모임 시간
            </label>
            <TimePicker value={confirmedTime} onChange={setConfirmedTime} />
          </div>
        </div>
      )}
      {updateMeeting.isError && (
        <p className="text-xs text-danger">수정에 실패했어요. 다시 시도해주세요.</p>
      )}
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          loading={updateMeeting.isPending}
          onClick={handleSave}
        >
          저장
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose}>
          취소
        </Button>
      </div>
    </div>
  );
}

// 조율 중(PENDING)일 때 소유자용 확정 도구.
// 전원 응답 & 공통 날짜 없음이면 긴급 안내(urgent), 그 외에는 임의 확정 옵션.
function ManualConfirmSection({
  meeting,
  orgId,
  urgent,
}: {
  meeting: MeetingDto;
  orgId: string;
  urgent: boolean;
}) {
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState<string | null>(null);
  const updateMeeting = useUpdateMeeting(orgId, meeting.id);

  const ranked = Object.entries(meeting.dateCounts ?? {}).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

  const nonResponders = meeting.nonResponders ?? [];

  const handleConfirm = (date: string, count: number) => {
    const timeLabel = manualTime ? ` ${manualTime}` : '';
    if (
      window.confirm(
        `${formatKoreanDate(date)}${timeLabel} (${count}/${meeting.totalMembers}명 가능)로 확정할까요?`,
      )
    ) {
      updateMeeting.mutate({
        confirmedDate: date,
        confirmedTime: manualTime ?? undefined,
      });
    }
  };

  return (
    <div className="mt-4 border-t border-line pt-4 space-y-3">
      <p
        className={`text-xs font-semibold ${
          urgent ? 'text-ink font-semibold' : 'text-muted'
        }`}
      >
        {urgent
          ? '전원 가능한 날짜가 없어요. 날짜를 직접 확정해주세요.'
          : '소유자는 응답을 기다리지 않고 날짜를 직접 확정할 수 있어요.'}
      </p>

      {nonResponders.length > 0 && (
        <p className="text-xs text-muted">
          미응답 — {nonResponders.map((n) => n.nickname).join(', ')}
        </p>
      )}

      {ranked.length > 0 && (
        <ul className="space-y-2">
          {ranked.slice(0, 5).map(([date, count]) => (
            <li key={date} className="flex items-center justify-between text-xs">
              <span className="text-ink">
                {formatKoreanDate(date)} — {count}/{meeting.totalMembers}명 가능
              </span>
              <button
                type="button"
                onClick={() => handleConfirm(date, count)}
                disabled={updateMeeting.isPending}
                className="font-semibold text-ink border-b border-line hover:text-muted-2 hover:border-muted-2 disabled:opacity-50"
              >
                이 날짜로 확정
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <div className="flex-1 max-w-[200px]">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted mb-1.5">
            직접 선택 (후보 기간 내)
          </label>
          <input
            type="date"
            value={manualDate}
            onChange={(e) => setManualDate(e.target.value)}
            min={toDateInputValue(meeting.candidateFrom)}
            max={toDateInputValue(meeting.candidateTo)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted mb-1.5">
            모임 시간
          </label>
          <TimePicker value={manualTime} onChange={setManualTime} />
        </div>
        <button
          type="button"
          onClick={() =>
            handleConfirm(manualDate, meeting.dateCounts?.[manualDate] ?? 0)
          }
          disabled={!manualDate || updateMeeting.isPending}
          className="pb-2 text-xs font-semibold text-ink border-b border-line hover:text-muted-2 hover:border-muted-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          이 날짜로 확정
        </button>
      </div>

      {updateMeeting.isError && (
        <p className="text-xs text-danger">확정에 실패했어요. 다시 시도해주세요.</p>
      )}
    </div>
  );
}

export function MeetingCard({ meeting, orgId, canManage = false }: MeetingCardProps) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const deleteMeeting = useDeleteMeeting(orgId, meeting.id);

  const needsManualConfirm =
    meeting.status === 'PENDING' &&
    meeting.totalMembers > 0 &&
    meeting.respondedCount >= meeting.totalMembers;

  const label =
    meeting.bookTitle && meeting.movieTitle
      ? `${meeting.bookTitle} · ${meeting.movieTitle}`
      : meeting.bookTitle || meeting.movieTitle || '(제목 없음)';

  const kindLabel =
    meeting.bookTitle && meeting.movieTitle
      ? '책 · 영화'
      : meeting.movieTitle
        ? '영화'
        : '책';

  // 저자/감독/연도 — 제목 아래 한 줄로 합친다
  const creator = [
    meeting.bookTitle ? meeting.bookAuthor : null,
    meeting.movieTitle && meeting.movieDirector
      ? `${meeting.movieDirector} 감독`
      : null,
    meeting.movieWork?.releaseDate?.slice(0, 4) ?? null,
  ]
    .filter(Boolean)
    .join(' · ');

  // 날짜 · 장소 — 헤어라인으로 끊어 읽는 메타 줄
  const meta = [
    meeting.confirmedDate
      ? `${formatKoreanDate(meeting.confirmedDate)}${
          meeting.confirmedTime ? ` ${meeting.confirmedTime}` : ''
        }`
      : null,
    meeting.location,
  ].filter((v): v is string => Boolean(v));

  const showAvailabilityLink =
    meeting.status === 'PENDING';
  const showMeetingLink =
    meeting.status === 'CONFIRMED' &&
    meeting.confirmedDate &&
    isToday(meeting.confirmedDate);
  const showDiscussionLink = meeting.status === 'DONE' && meeting.discussionId;

  // 날짜 확정 → 발제문 자동 생성. 생성 중 표시와, 완료 시 보기 버튼.
  const discussionGenerating =
    meeting.status === 'CONFIRMED' &&
    (!meeting.discussionId || meeting.discussionStatus === 'GENERATING');
  const discussionReady =
    meeting.status === 'CONFIRMED' &&
    (meeting.discussionStatus === 'GENERATED' ||
      meeting.discussionStatus === 'PUBLISHED');
  // 실패는 "생성 중"으로 계속 두지 않고, 작품 정보를 고칠 수 있는 화면으로 안내
  const discussionFailed =
    meeting.status === 'CONFIRMED' && meeting.discussionStatus === 'FAILED';

  let statusPill: { text: string; className: string };
  if (meeting.status === 'PENDING') {
    statusPill = needsManualConfirm
      ? {
          text: '날짜 확정 필요',
          className: 'border border-ink rounded-hair font-semibold text-ink',
        }
      : {
          text: `일정 조율 중 · ${meeting.respondedCount}/${meeting.totalMembers}`,
          className: 'border border-line rounded-hair text-muted',
        };
  } else if (meeting.status === 'CONFIRMED' && meeting.confirmedDate) {
    const timeSuffix = meeting.confirmedTime ? ` ${meeting.confirmedTime}` : '';
    statusPill = {
      text: isToday(meeting.confirmedDate)
        ? `오늘${timeSuffix}`
        : `${formatKoreanDate(meeting.confirmedDate)}${timeSuffix} 확정`,
      className: 'border border-point rounded-hair bg-point text-on-accent',
    };
  } else if (meeting.status === 'DONE') {
    statusPill = {
      text: '종료',
      className: 'rounded-hair bg-surface-2 text-muted',
    };
  } else {
    statusPill = {
      text: '취소됨',
      className: 'border border-line rounded-hair text-muted line-through',
    };
  }

  return (
    <Card>
      <div className="flex items-start gap-4 sm:gap-5">
        <WorkCover meeting={meeting} className="w-[64px] sm:w-[76px]" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold tracking-[0.16em] text-muted">
              {kindLabel}
            </span>
            <span
              className={`px-2 py-[3px] text-[10px] font-semibold whitespace-nowrap ${statusPill.className}`}
            >
              {statusPill.text}
            </span>
          </div>
          <h3 className="mt-2 truncate text-[21px] font-bold tracking-[-0.03em]">
            {label}
          </h3>
          {creator && (
            <p className="mt-1 truncate text-[13px] font-light text-muted">
              {creator}
            </p>
          )}
          {meta.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-muted-2">
              {meta.map((m, i) => (
                <span key={m} className="flex items-center gap-2.5">
                  {i > 0 && (
                    <span aria-hidden="true" className="h-3 w-px bg-line" />
                  )}
                  <span className={i === 0 ? 'tabular-nums' : undefined}>
                    {m}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-4 text-xs">
        {showAvailabilityLink && (
          <Link
            to={`/orgs/${orgId}/meetings/${meeting.id}/availability`}
            className="font-semibold text-ink border-b border-line hover:text-muted-2 hover:border-muted-2"
          >
            {meeting.myAvailability?.length ? '내 응답 수정' : '가능한 날짜 선택'}
          </Link>
        )}
        {showMeetingLink && (
          <Link
            to={`/orgs/${orgId}/meetings/${meeting.id}`}
            className="font-semibold text-ink border-b border-line hover:text-muted-2 hover:border-muted-2"
          >
            모임 입장
          </Link>
        )}
        {showDiscussionLink && (
          <Link
            to={`/orgs/${orgId}/meetings/${meeting.id}`}
            className="font-medium text-muted border-b border-muted hover:text-ink hover:border-ink"
          >
            발제문 다시 보기
          </Link>
        )}
        {discussionGenerating && (
          <span className="flex items-center gap-1.5 font-medium text-muted">
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 bg-point animate-[blink_1.2s_ease_infinite]"
            />
            발제문 생성 중…
          </span>
        )}
        {discussionFailed && (
          <Link
            to={`/orgs/${orgId}/meetings/${meeting.id}`}
            className="font-semibold text-danger border-b border-danger hover:text-danger-2 hover:border-danger-2"
          >
            발제문 생성 실패 · 작품 정보 확인
          </Link>
        )}
        {discussionReady && !showMeetingLink && (
          <Link
            to={`/orgs/${orgId}/meetings/${meeting.id}`}
            className="font-semibold text-ink border-b border-line hover:text-muted-2 hover:border-muted-2"
          >
            발제문 보기
          </Link>
        )}

        {canManage && !editing && (
          <span className="ml-auto flex items-center gap-4">
            {confirmingDelete ? (
              <>
                <button
                  type="button"
                  onClick={() => deleteMeeting.mutate()}
                  disabled={deleteMeeting.isPending}
                  className="font-medium text-danger border-b border-danger hover:text-danger-2 hover:border-danger-2 disabled:opacity-50"
                >
                  {deleteMeeting.isPending ? '삭제 중…' : '정말 삭제'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="font-medium text-muted border-b border-muted hover:text-ink hover:border-ink"
                >
                  취소
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="font-medium text-muted border-b border-muted hover:text-ink hover:border-ink"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="font-medium text-danger border-b border-danger hover:text-danger-2 hover:border-danger-2"
                >
                  삭제
                </button>
              </>
            )}
          </span>
        )}
      </div>

      {deleteMeeting.isError && (
        <p className="mt-2 text-xs text-danger">삭제에 실패했어요. 다시 시도해주세요.</p>
      )}

      {canManage && meeting.status === 'PENDING' && (
        <ManualConfirmSection
          meeting={meeting}
          orgId={orgId}
          urgent={needsManualConfirm}
        />
      )}

      {editing && (
        <MeetingEditForm
          meeting={meeting}
          orgId={orgId}
          onClose={() => setEditing(false)}
        />
      )}
    </Card>
  );
}
