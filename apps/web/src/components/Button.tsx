import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'dark' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
}

// 박스형(테두리를 그리는) variant 는 fullWidth 일 때 라벨·화살표를 양끝으로 배치한다.
const boxedVariants: Variant[] = ['primary', 'dark', 'outline'];

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-point text-on-accent border border-point rounded-ui hover:bg-point-hover hover:border-point-hover disabled:bg-surface-2 disabled:border-surface-2 disabled:text-muted',
  dark: 'bg-ink text-paper border border-ink rounded-ui hover:bg-muted-2 hover:border-muted-2 disabled:bg-surface-2 disabled:border-surface-2 disabled:text-muted',
  outline:
    'bg-transparent text-ink border border-line rounded-ui hover:bg-surface-2 hover:border-ink disabled:text-muted disabled:border-line',
  ghost:
    'bg-transparent text-muted rounded-ui hover:bg-surface-2 hover:text-ink disabled:text-muted/50 disabled:hover:bg-transparent',
  // 흑백에는 경고색이 없다 — 파괴적 액션은 밑줄로 구분하고 확인 단계로 막는다.
  danger:
    'bg-transparent text-danger underline underline-offset-4 decoration-1 decoration-line hover:decoration-ink disabled:text-muted disabled:no-underline',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-3.5 min-h-9 font-semibold',
  md: 'text-sm px-[18px] min-h-11 font-semibold',
  lg: 'text-[15px] px-6 min-h-14 font-semibold',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth,
    loading,
    className = '',
    disabled,
    children,
    ...rest
  },
  ref,
) {
  const spread = fullWidth && boxedVariants.includes(variant);
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center gap-3 cursor-pointer tracking-tight transition-colors',
        spread ? 'justify-between' : 'justify-center',
        'disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading ? (
        <span className="loading loading-spinner loading-sm" />
      ) : (
        children
      )}
    </button>
  );
});
