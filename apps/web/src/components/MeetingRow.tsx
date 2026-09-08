import { Link } from 'react-router-dom';
import type { MeetingDto } from '@inos/types';
import { WorkCover } from './WorkCover';

interface MeetingRowProps {
  meeting: MeetingDto;
  orgId: string;
}

function formatShortDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}.${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * 지난 모임 한 줄. 카드로 감싸지 않고 헤어라인으로만 행을 나눈다 —
 * 끝난 일은 훑어보는 것이지 들여다보는 것이 아니다.
 */
export function MeetingRow({ meeting, orgId }: MeetingRowProps) {
  const label =
    meeting.bookTitle && meeting.movieTitle
      ? `${meeting.bookTitle} · ${meeting.movieTitle}`
      : meeting.bookTitle || meeting.movieTitle || '(제목 없음)';

  const cancelled = meeting.status === 'CANCELLED';

  return (
    <li>
      <Link
        to={`/orgs/${orgId}/meetings/${meeting.id}`}
        className="flex items-center gap-3.5 border-b border-line px-1 py-3 transition-colors hover:bg-surface-2"
      >
        <WorkCover
          meeting={meeting}
          className="w-[26px]"
          rounded="rounded-[4px]"
        />
        <span
          className={`min-w-0 flex-1 truncate text-sm font-medium ${
            cancelled ? 'text-muted line-through' : ''
          }`}
        >
          {label}
        </span>
        {meeting.discussionId && (
          <span className="hidden shrink-0 text-[11px] text-muted sm:inline">
            발제문
          </span>
        )}
        <span className="shrink-0 text-xs tabular-nums text-muted">
          {formatShortDate(meeting.confirmedDate)}
        </span>
        <svg
          width="7"
          height="11"
          viewBox="0 0 7 11"
          fill="none"
          aria-hidden="true"
          className="shrink-0 text-muted"
        >
          <path
            d="M1 1l4.5 4.5L1 10"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </li>
  );
}
