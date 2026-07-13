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
        'bg-white rounded-2xl border border-neutral-200 p-4',
        interactive ? 'card-hover' : '',
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
