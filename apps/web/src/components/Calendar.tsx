import { useMemo, useState } from 'react';

type DisplayMode = 'display' | 'multi-select';

interface CalendarProps {
  mode: DisplayMode;
  value?: string | string[] | null; // ISO date-only strings YYYY-MM-DD
  onChange?: (next: string[]) => void;
  highlightedDates?: string[];
  minDate?: string;
  maxDate?: string;
  initialMonth?: string; // YYYY-MM
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function toDateOnlyIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseIsoLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function firstOfMonth(iso: string): Date {
  const [y, m] = iso.split('-').map(Number);
  return new Date(y, m - 1, 1);
}

function isoMonth(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function Calendar({
  mode,
  value,
  onChange,
  highlightedDates = [],
  minDate,
  maxDate,
  initialMonth,
}: CalendarProps) {
  const initial = useMemo(() => {
    if (initialMonth) return firstOfMonth(initialMonth + '-01');
    if (typeof value === 'string' && value) return firstOfMonth(value);
    if (Array.isArray(value) && value[0]) return firstOfMonth(value[0]);
    if (minDate) return firstOfMonth(minDate);
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  }, [initialMonth, value, minDate]);

  const [monthAnchor, setMonthAnchor] = useState<Date>(initial);

  const selectedSet = useMemo(() => {
    if (mode === 'display') return new Set<string>();
    if (Array.isArray(value)) return new Set(value);
    return new Set<string>();
  }, [mode, value]);

  const highlightSet = useMemo(() => new Set(highlightedDates), [highlightedDates]);
  const singleSelected =
    mode === 'display' && typeof value === 'string' ? value : null;

  const minD = minDate ? parseIsoLocal(minDate) : null;
  const maxD = maxDate ? parseIsoLocal(maxDate) : null;

  const cells = useMemo(() => {
    const firstDay = new Date(
      monthAnchor.getFullYear(),
      monthAnchor.getMonth(),
      1,
    );
    const lastDay = new Date(
      monthAnchor.getFullYear(),
      monthAnchor.getMonth() + 1,
      0,
    );
    const startWeekday = firstDay.getDay();
    const days = lastDay.getDate();

    const result: Array<{ iso: string; day: number } | null> = [];
    for (let i = 0; i < startWeekday; i++) result.push(null);
    for (let d = 1; d <= days; d++) {
      const iso = toDateOnlyIso(
        new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), d),
      );
      result.push({ iso, day: d });
    }
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [monthAnchor]);

  const canGoPrev =
    !minD ||
    new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() - 1, 1) >=
      new Date(minD.getFullYear(), minD.getMonth(), 1);
  const canGoNext =
    !maxD ||
    new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 1) <=
      new Date(maxD.getFullYear(), maxD.getMonth(), 1);

  const toggle = (iso: string, disabled: boolean) => {
    if (disabled || mode !== 'multi-select' || !onChange) return;
    const next = new Set(selectedSet);
    if (next.has(iso)) next.delete(iso);
    else next.add(iso);
    onChange(Array.from(next).sort());
  };

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() =>
            canGoPrev &&
            setMonthAnchor(
              new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() - 1, 1),
            )
          }
          disabled={!canGoPrev}
          className="w-8 h-8 rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-neutral-900">
          {isoMonth(monthAnchor).replace('-', '년 ')}월
        </span>
        <button
          type="button"
          onClick={() =>
            canGoNext &&
            setMonthAnchor(
              new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 1),
            )
          }
          disabled={!canGoNext}
          className="w-8 h-8 rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-neutral-400 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell) return <div key={idx} className="h-10" />;
          const inRange =
            (!minD || parseIsoLocal(cell.iso) >= minD) &&
            (!maxD || parseIsoLocal(cell.iso) <= maxD);
          const isSelected = selectedSet.has(cell.iso);
          const isHighlighted = highlightSet.has(cell.iso);
          const isSingle = singleSelected === cell.iso;
          const disabled = !inRange;

          const classes = [
            'h-10 rounded-lg text-sm flex items-center justify-center transition-colors',
            disabled
              ? 'text-neutral-300 cursor-not-allowed'
              : mode === 'multi-select'
                ? 'cursor-pointer hover:bg-neutral-100'
                : 'text-neutral-800',
            isSelected
              ? 'bg-[color:var(--color-point)] text-neutral-900 font-medium hover:brightness-95'
              : '',
            !isSelected && (isHighlighted || isSingle)
              ? 'ring-2 ring-[color:var(--color-point)] font-medium text-neutral-900'
              : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => toggle(cell.iso, disabled)}
              disabled={disabled}
              className={classes}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
