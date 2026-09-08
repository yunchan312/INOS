import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  /** 제목 위에 놓을 그림 (마스코트 등). 없으면 활자만으로 비운다. */
  media?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  media,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {media && <div className="mb-4">{media}</div>}
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {description && (
        <p className="mt-2 max-w-sm text-[13px] font-light leading-relaxed text-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
