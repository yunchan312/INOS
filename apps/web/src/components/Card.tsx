import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
}

export function Card({
  children,
  interactive,
  className = '',
  ...rest
}: CardProps) {
  return (
    <div
      className={[
        'bg-surface border border-line rounded-card p-5',
        interactive ? 'card-hover hover:border-muted-2' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
