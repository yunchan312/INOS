import { useMemo, useRef, useState, type PointerEvent } from 'react';

// WhenSee식 날짜 캘린더.
// - paint 모드: 드래그로 여러 날짜를 한 번에 칠하기/지우기 (마우스·터치 공통)
// - heatmap 모드: 날짜별 가능 인원을 point 색 농도로 표시, 클릭하면 상세 조회

type Mode = 'paint' | 'heatmap';

interface AvailabilityCalendarProps {
  mode: Mode;
  minDate: string;
  maxDate: string;
  /** paint: 내가 선택한 날짜들 */
  value?: string[];
  onChange?: (dates: string[]) => void;
  /** heatmap: 날짜별 가능 인원 수 */
  counts?: Record<string, number>;
  /** heatmap: 전체 인원 (농도 기준) */
  total?: number;
  /** heatmap: 상세 조회 중인 날짜 */
  focusedDate?: string | null;
  onFocusDate?: (iso: string | null) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function parseIsoLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function AvailabilityCalendar({
  mode,
  minDate,
  maxDate,
  value = [],
  onChange,
  counts = {},
  total = 0,
  focusedDate,
  onFocusDate,
}: AvailabilityCalendarProps) {
  const [monthAnchor, setMonthAnchor] = useState<Date>(() => {
    const d = parseIsoLocal(minDate);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const selectedSet = useMemo(() => new Set(value), [value]);
  const minD = parseIsoLocal(minDate);
  const maxD = parseIsoLocal(maxDate);

  // 드래그 페인팅 상태 — 첫 셀의 반대 상태로 칠할지/지울지 결정 (When2meet 방식).
  // 제스처 동안의 누적은 ref로 관리해 React 배칭/리렌더 타이밍과 무관하게 동작시킨다.
  const paintingRef = useRef<{ additive: boolean; working: Set<string> } | null>(
    null,
  );

  const cells = useMemo(() => {
    const first = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
    const last = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0);
    const result: Array<{ iso: string; day: number } | null> = [];
    for (let i = 0; i < first.getDay(); i++) result.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      result.push({
        iso: toIso(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), d)),
        day: d,
      });
    }
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [monthAnchor]);

  const canGoPrev =
    new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() - 1, 1) >=
    new Date(minD.getFullYear(), minD.getMonth(), 1);
  const canGoNext =
    new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 1) <=
    new Date(maxD.getFullYear(), maxD.getMonth(), 1);

  const inRange = (iso: string) => {
    const d = parseIsoLocal(iso);
    return d >= minD && d <= maxD;
  };

  const applyPaint = (iso: string) => {
    if (!onChange || !paintingRef.current) return;
    const { additive, working } = paintingRef.current;
    if (additive === working.has(iso)) return;
    if (additive) working.add(iso);
    else working.delete(iso);
    onChange(Array.from(working).sort());
  };

  const startPaint = (iso: string) => {
    if (mode !== 'paint' || !inRange(iso)) return;
    paintingRef.current = {
      additive: !selectedSet.has(iso),
      working: new Set(selectedSet),
    };
    applyPaint(iso);
  };

  // 터치에서도 동작하도록 좌표 → 셀 탐색 (implicit pointer capture 대응)
  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (mode !== 'paint' || !paintingRef.current) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const iso = el?.closest<HTMLElement>('[data-iso]')?.dataset.iso;
    if (iso && inRange(iso)) applyPaint(iso);
  };

  const endPaint = () => {
    paintingRef.current = null;
  };

  const heatStyle = (count: number): React.CSSProperties | undefined => {
    if (mode !== 'heatmap' || total <= 0 || count <= 0) return undefined;
    const pct = Math.round((count / total) * 100);
    return {
      backgroundColor: `color-mix(in srgb, var(--color-point) ${pct}%, var(--color-paper))`,
    };
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
          className="w-9 h-9 border-2 border-ink text-ink font-bold hover:bg-ink/[0.06] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ‹
        </button>
        <span className="text-[15px] font-bold tracking-wide">
          {monthAnchor.getFullYear()}년 {monthAnchor.getMonth() + 1}월
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
          className="w-9 h-9 border-2 border-ink text-ink font-bold hover:bg-ink/[0.06] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>

      <div
        className={[
          'grid grid-cols-7 border-t-2 border-l-2 border-ink',
          mode === 'paint' ? 'touch-none' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onPointerMove={handlePointerMove}
        onPointerUp={endPaint}
        onPointerLeave={endPaint}
        onPointerCancel={endPaint}
      >
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="py-1.5 text-center text-[11px] font-bold tracking-[0.1em] border-r-2 border-b-2 border-ink bg-ink text-paper"
          >
            {w}
          </div>
        ))}
        {cells.map((cell, idx) => {
          if (!cell) {
            return (
              <div
                key={idx}
                className="h-12 border-r-2 border-b-2 border-ink bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(128,124,118,0.12)_5px,rgba(128,124,118,0.12)_6px)]"
              />
            );
          }
          const disabled = !inRange(cell.iso);
          const isSelected = mode === 'paint' && selectedSet.has(cell.iso);
          const count = counts[cell.iso] ?? 0;
          const isFull = mode === 'heatmap' && total > 0 && count === total;
          const isFocused = mode === 'heatmap' && focusedDate === cell.iso;

          return (
            <button
              key={cell.iso}
              type="button"
              data-iso={disabled ? undefined : cell.iso}
              disabled={disabled}
              onPointerDown={() => startPaint(cell.iso)}
              onClick={() =>
                mode === 'heatmap' &&
                !disabled &&
                onFocusDate?.(focusedDate === cell.iso ? null : cell.iso)
              }
              style={heatStyle(count)}
              className={[
                'relative h-12 border-r-2 border-b-2 border-ink text-sm flex items-center justify-center',
                disabled
                  ? 'text-line cursor-not-allowed'
                  : 'cursor-pointer text-ink',
                mode === 'paint' && !disabled && !isSelected ? 'bg-paper hover:bg-ink/[0.06]' : '',
                isSelected ? 'bg-point text-on-accent font-bold' : '',
                isFull ? 'font-extrabold text-on-accent' : '',
                isFocused ? 'ring-2 ring-inset ring-ink font-bold' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {cell.day}
              {mode === 'heatmap' && !disabled && count > 0 && (
                <span className="absolute top-0.5 right-1 text-[9px] font-bold leading-none opacity-70">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {mode === 'heatmap' && total > 0 && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted">
          <span>0</span>
          {[0, 25, 50, 75, 100].map((pct) => (
            <span
              key={pct}
              className="h-3 w-6 border border-line"
              style={{
                backgroundColor: `color-mix(in srgb, var(--color-point) ${pct}%, var(--color-paper))`,
              }}
            />
          ))}
          <span>전원 ({total}명)</span>
        </div>
      )}
    </div>
  );
}
