import { useState } from 'react';
import type { CreateManualLibraryEntryDto, PromptKind } from '@inos/types';
import { Button } from '@/components/Button';

interface ManualEntryFormProps {
  onSubmit: (dto: CreateManualLibraryEntryDto) => void;
  onClose: () => void;
  isSaving: boolean;
  hasError: boolean;
}

export function ManualEntryForm({
  onSubmit,
  onClose,
  isSaving,
  hasError,
}: ManualEntryFormProps) {
  const [kind, setKind] = useState<PromptKind>('BOOK');
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [finishedAt, setFinishedAt] = useState('');
  const [discussionText, setDiscussionText] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      kind,
      title: title.trim(),
      creator: creator.trim() || null,
      finishedAt: finishedAt || null,
      discussionText: discussionText.trim() || null,
    });
  };

  return (
    <div className="mt-6 border-2 border-ink bg-surface p-5">
      <p className="text-sm font-extrabold">책/영화 직접 추가</p>
      <p className="mt-1 text-xs text-muted">
        모임 없이 혼자 읽고 본 것도 서가에 꽂을 수 있어요.
      </p>

      <div className="mt-4 flex gap-0 border-2 border-ink w-fit">
        {(['BOOK', 'MOVIE'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={[
              'px-4 py-1.5 text-[13px] font-bold',
              kind === k ? 'bg-ink text-paper' : 'text-muted hover:text-ink',
            ].join(' ')}
          >
            {k === 'BOOK' ? '책' : '영화'}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            제목 (필수)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 200))}
            className="input-underline mt-1 text-[15px]"
            placeholder={kind === 'BOOK' ? '예: 데미안' : '예: 기생충'}
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            {kind === 'BOOK' ? '저자' : '감독'}
          </label>
          <input
            type="text"
            value={creator}
            onChange={(e) => setCreator(e.target.value.slice(0, 200))}
            className="input-underline mt-1 text-[15px]"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            {kind === 'BOOK' ? '읽은 날' : '본 날'}
          </label>
          <input
            type="date"
            value={finishedAt}
            onChange={(e) => setFinishedAt(e.target.value)}
            className="input-underline mt-1 text-[15px]"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          발제문 (선택)
        </label>
        <textarea
          rows={4}
          value={discussionText}
          onChange={(e) => setDiscussionText(e.target.value.slice(0, 5000))}
          placeholder="함께 나눴던(나누고 싶은) 질문이나 생각을 적어두세요."
          className="mt-1 w-full box-border resize-y border-2 border-ink bg-surface-2 p-3 text-sm leading-relaxed outline-none focus:border-point-hover"
        />
      </div>

      {hasError && (
        <p className="mt-2 text-xs text-danger">저장에 실패했어요. 다시 시도해주세요.</p>
      )}

      <div className="mt-4 flex gap-2">
        <Button
          variant="primary"
          size="md"
          loading={isSaving}
          disabled={!title.trim()}
          onClick={handleSubmit}
        >
          서가에 추가
        </Button>
        <Button variant="ghost" size="md" onClick={onClose}>
          닫기
        </Button>
      </div>
    </div>
  );
}
