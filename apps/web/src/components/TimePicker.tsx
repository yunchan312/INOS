const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '10', '20', '30', '40', '50'];

interface TimePickerProps {
  /** "HH:mm" 또는 null(시간 미정) */
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

const selectClass =
  'appearance-none bg-transparent pl-2.5 pr-6 py-1.5 text-sm font-semibold text-ink cursor-pointer outline-none focus-visible:bg-point/20 disabled:cursor-not-allowed disabled:text-muted';

const chevron = (
  <span
    aria-hidden="true"
    className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-muted"
  >
    ▼
  </span>
);

// 디자인 시스템 톤(2px ink 보더, 각진 박스)에 맞춘 시/분 선택기.
// 시(hour)에서 "미정"을 고르면 null로 초기화된다.
export function TimePicker({ value, onChange, disabled = false }: TimePickerProps) {
  const [hour, minute] = value ? value.split(':') : ['', '00'];

  const handleHourChange = (nextHour: string) => {
    if (!nextHour) {
      onChange(null);
      return;
    }
    onChange(`${nextHour}:${value ? minute : '00'}`);
  };

  return (
    <div
      className={`inline-flex items-stretch border-2 border-ink bg-surface ${
        disabled ? 'opacity-50' : ''
      }`}
      role="group"
      aria-label="모임 시간 선택"
    >
      <span className="relative flex items-center">
        <select
          value={hour}
          onChange={(e) => handleHourChange(e.target.value)}
          disabled={disabled}
          aria-label="시"
          className={selectClass}
        >
          <option value="">미정</option>
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {h}시
            </option>
          ))}
        </select>
        {chevron}
      </span>
      <span aria-hidden="true" className="border-l-2 border-ink" />
      <span className="relative flex items-center">
        <select
          value={value ? minute : '00'}
          onChange={(e) => hour && onChange(`${hour}:${e.target.value}`)}
          disabled={disabled || !hour}
          aria-label="분"
          className={selectClass}
        >
          {MINUTES.map((m) => (
            <option key={m} value={m}>
              {m}분
            </option>
          ))}
        </select>
        {chevron}
      </span>
    </div>
  );
}
