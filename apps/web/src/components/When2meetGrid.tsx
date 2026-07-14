import { Calendar } from './Calendar';

interface When2meetGridProps {
  value: string[];
  onChange: (dates: string[]) => void;
  minDate: string;
  maxDate: string;
  /** 날짜별 다른 멤버 응답 수 */
  badges?: Record<string, number>;
}

export function When2meetGrid({
  value,
  onChange,
  minDate,
  maxDate,
  badges,
}: When2meetGridProps) {
  const hasBadges = badges && Object.keys(badges).length > 0;
  return (
    <div>
      <Calendar
        mode="multi-select"
        value={value}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        initialMonth={minDate.slice(0, 7)}
        badges={badges}
      />
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[13px] font-semibold">
          선택한 날짜 <span className="bg-point px-2 py-0.5">{value.length}개</span>
        </p>
        {hasBadges && (
          <p className="text-xs text-muted">
            우측 상단 숫자 = 그 날짜가 가능한 다른 멤버 수
          </p>
        )}
      </div>
    </div>
  );
}
