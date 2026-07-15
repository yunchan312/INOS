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
    'bg-point text-on-accent border-2 border-ink hover:bg-point-hover disabled:bg-line disabled:border-line disabled:text-muted',
  dark: 'bg-ink text-paper border-2 border-ink hover:bg-muted-2 hover:border-muted-2 disabled:bg-line disabled:border-line disabled:text-paper',
  outline:
    'bg-transparent text-ink border-2 border-ink hover:bg-ink/[0.06] disabled:text-muted disabled:border-line',
  ghost:
    'bg-transparent text-muted border-b border-muted hover:text-ink hover:border-ink disabled:text-muted/50 disabled:border-transparent',
  danger:
    'bg-transparent text-danger border-b border-danger hover:text-danger-2 hover:border-danger-2 disabled:text-muted disabled:border-transparent',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-3 min-h-9 font-semibold',
  md: 'text-sm px-4 min-h-11 font-bold',
  lg: 'text-base px-5 min-h-14 font-bold',
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
