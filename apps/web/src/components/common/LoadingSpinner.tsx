interface Props {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = 'md', fullScreen = false }: Props) {
  const dim = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size];

  const spinner = (
    <span
      className={`${dim} inline-block rounded-full border-2 border-[oklch(92%_0.005_80)] border-t-[oklch(30%_0.13_268)] animate-spin`}
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
