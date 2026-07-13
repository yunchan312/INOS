import { Calendar } from './Calendar';

interface When2meetGridProps {
  value: string[];
  onChange: (dates: string[]) => void;
  minDate: string;
  maxDate: string;
}

export function When2meetGrid({
  value,
  onChange,
  minDate,
  maxDate,
}: When2meetGridProps) {
  return (
    <div>
      <Calendar
        mode="multi-select"
        value={value}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        initialMonth={minDate.slice(0, 7)}
      />
      <p className="mt-3 text-xs text-neutral-500 text-center">
        선택한 날짜: {value.length}개
      </p>
    </div>
  );
}
