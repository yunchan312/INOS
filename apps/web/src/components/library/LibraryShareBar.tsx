import { useState } from 'react';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { LibraryShareDto } from '@inos/types';
import { Button } from '@/components/Button';

// 개인 서재(useLibraryShare)·오가니제이션 서가(useGroupLibraryShare) 공용 공유 바.
interface LibraryShareBarProps {
  status: UseQueryResult<LibraryShareDto>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enable: UseMutationResult<any, unknown, void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  disable: UseMutationResult<any, unknown, void>;
  title?: string;
  description?: string;
}

export function LibraryShareBar({
  status,
  enable,
  disable,
  title = '내 서재를 공유해보세요',
  description = '링크를 아는 사람은 로그인 없이 내 서가를 볼 수 있어요.',
}: LibraryShareBarProps) {
  const [copied, setCopied] = useState(false);

  const shareId = status.data?.shareId ?? null;
  const url = shareId ? `${window.location.origin}/s/${shareId}` : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 클립보드 접근 실패 시 입력창에서 직접 복사 */
    }
  };

  if (status.isLoading) return null;

  return (
    <div className="mt-6 border-2 border-ink bg-surface p-4">
      {shareId ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            공개 중
          </span>
          <input
            readOnly
            value={url}
            onFocus={(e) => e.target.select()}
            className="input-underline min-w-[200px] flex-1 text-sm"
          />
          <Button variant="primary" size="sm" onClick={copy}>
            {copied ? '복사됨!' : '링크 복사'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            loading={disable.isPending}
            onClick={() => disable.mutate()}
          >
            비공개로
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold">{title}</p>
            <p className="mt-1 text-xs text-muted">{description}</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            loading={enable.isPending}
            onClick={() => enable.mutate()}
          >
            서가 공개하기
          </Button>
        </div>
      )}
    </div>
  );
}
