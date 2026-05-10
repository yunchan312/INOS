import type { MeetingStatus } from '@inos/types';

interface Props {
  status: MeetingStatus;
}

const STATUS_CONFIG: Record<MeetingStatus, { label: string; bg: string; text: string }> = {
  PENDING:   { label: '일정 조율 중', bg: 'oklch(93% 0.04 68)',  text: 'oklch(47% 0.10 68)' },
  CONFIRMED: { label: '일정 확정',    bg: 'oklch(91% 0.06 152)', text: 'oklch(38% 0.12 152)' },
  DONE:      { label: '완료',         bg: 'oklch(92% 0.005 80)', text: 'oklch(47% 0.004 80)' },
  CANCELLED: { label: '취소됨',       bg: 'oklch(93% 0.04 18)',  text: 'oklch(45% 0.18 18)' },
};

export function MeetingStatusBadge({ status }: Props) {
  const { label, bg, text } = STATUS_CONFIG[status];
  return (
    <span
      className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full"
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
}
