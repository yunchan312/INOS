import { useThemeStore, type ThemeMode } from '@/stores/theme-store';

const OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'light', label: '라이트', icon: '☀' },
  { mode: 'system', label: '시스템', icon: '◐' },
  { mode: 'dark', label: '다크', icon: '☾' },
];

export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <div
      className="flex border-2 border-ink"
      role="group"
      aria-label="테마 선택"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.mode}
          type="button"
          onClick={() => setMode(o.mode)}
          aria-pressed={mode === o.mode}
          title={o.label}
          className={[
            'flex h-7 w-7 items-center justify-center text-[13px] leading-none transition-colors',
            mode === o.mode
              ? 'bg-ink text-paper'
              : 'text-muted hover:text-ink',
          ].join(' ')}
        >
          <span aria-hidden="true">{o.icon}</span>
        </button>
      ))}
    </div>
  );
}
