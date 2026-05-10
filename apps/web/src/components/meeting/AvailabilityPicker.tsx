import { useState } from 'react';

interface Props {
  onSubmit: (dates: string[]) => void;
  isLoading?: boolean;
}

function getDatesInRange(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 1; i <= days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split('T')[0]!);
  }
  return dates;
}

export function AvailabilityPicker({ onSubmit, isLoading }: Props) {
  const dates = getDatesInRange(14);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (date: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-base-content/60">가능한 날짜를 선택하세요</p>
      <div className="grid grid-cols-7 gap-1">
        {dates.map((date) => {
          const d = new Date(date);
          const label = `${d.getMonth() + 1}/${d.getDate()}`;
          const isSelected = selected.has(date);
          return (
            <button
              key={date}
              type="button"
              onClick={() => toggle(date)}
              className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <button
        className="btn btn-primary w-full"
        disabled={selected.size === 0 || isLoading}
        onClick={() => onSubmit(Array.from(selected))}
      >
        {isLoading ? <span className="loading loading-spinner loading-sm" /> : '제출하기'}
      </button>
    </div>
  );
}
