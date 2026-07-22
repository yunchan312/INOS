import { useThemeStore, type ThemeMode } from '@/stores/theme-store';

const OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'light', label: '라이트', icon: '☀' },
  { mode: 'system', label: '시스템', icon: '◐' },
  { mode: 'dark', label: '다크', icon: '☾' },
];

// 푸터 톤에 맞춘 텍스트형 테마 선택 (활성 항목만 잉크색 + 밑줄)
export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <div
      className="flex items-baseline gap-x-4"
      role="group"
      aria-label="테마 선택"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.mode}
          type="button"
          onClick={() => setMode(o.mode)}
          aria-pressed={mode === o.mode}
          className={[
            'text-[11px] font-medium uppercase tracking-[0.1em] whitespace-nowrap transition-colors',
            mode === o.mode
              ? 'font-bold text-ink border-b border-ink'
              : 'text-muted hover:text-ink',
          ].join(' ')}
        >
          <span aria-hidden="true" className="mr-1">
            {o.icon}
          </span>
          {o.label}
        </button>
      ))}
    </div>
  );
}
