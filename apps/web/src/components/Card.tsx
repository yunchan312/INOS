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
        'bg-surface border-2 border-ink p-4',
        interactive ? 'card-hover hover:bg-point/20' : '',
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
