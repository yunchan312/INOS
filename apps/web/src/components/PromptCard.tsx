import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import type { DiscussionNoteDto, PromptKind } from '@inos/types';
import { PromptText } from './PromptText';

interface PromptCardProps {
  prompt: string;
  promptKind: PromptKind;
  questionIndex: number;
  /** 표시용 번호 (기본: questionIndex + 1) — 자체 발제는 노트 키와 번호가 다름 */
  displayNumber?: number;
  /** 질문 위에 표시할 배지 영역 (자체 발제문 배지 등) */
  meta?: ReactNode;
  myNote: DiscussionNoteDto | undefined;
  publicNotes: DiscussionNoteDto[];
  readOnly: boolean;
  onSave: (dto: { promptKind: PromptKind; questionIndex: number; content: string; isPublic: boolean }) => void;
}

export function PromptCard({
  prompt,
  promptKind,
  questionIndex,
  displayNumber,
  meta,
  myNote,
  publicNotes,
  readOnly,
  onSave,
}: PromptCardProps) {
  const [content, setContent] = useState(myNote?.content ?? '');
  const [isPublic, setIsPublic] = useState(myNote?.isPublic ?? false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (myNote) {
      setContent(myNote.content);
      setIsPublic(myNote.isPublic);
    }
  }, [myNote?.id]);

  const triggerSave = useCallback(
    (nextContent: string, nextPublic: boolean) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (nextContent.trim()) {
          onSave({ promptKind, questionIndex, content: nextContent, isPublic: nextPublic });
        }
      }, 800);
    },
    [promptKind, questionIndex, onSave],
  );

  const handleContentChange = (val: string) => {
    setContent(val);
    triggerSave(val, isPublic);
  };

  const handlePublicToggle = () => {
    const next = !isPublic;
    setIsPublic(next);
    if (content.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      onSave({ promptKind, questionIndex, content, isPublic: next });
    }
  };

  const othersNotes = publicNotes.filter((n) => n.userId !== myNote?.userId);

  return (
    <article className="py-9 border-b border-line grid grid-cols-[28px_minmax(0,1fr)] sm:grid-cols-[36px_minmax(0,1fr)] gap-3 sm:gap-4">
      <span className="pt-0.5 text-sm sm:text-base font-extrabold leading-relaxed text-muted tabular-nums">
        {String(displayNumber ?? questionIndex + 1).padStart(2, '0')}
      </span>
      <div>
        {meta}
        <PromptText
          content={prompt}
          className="text-lg font-normal leading-relaxed max-w-[62ch]"
        />

        {!readOnly && (
          <div className="mt-5 flex flex-col gap-2.5">
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="내 생각을 적어보세요…"
              rows={3}
              className="w-full box-border resize-y border-2 border-ink bg-surface px-3.5 py-3 text-sm leading-relaxed outline-none focus:border-point-hover"
            />
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={handlePublicToggle}
                  className="border-ink text-ink focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs font-semibold text-muted-2">멤버에게 공개</span>
              </label>
              {content.trim() && (
                <span className="text-xs text-muted">자동 저장됨</span>
              )}
            </div>
          </div>
        )}

        {myNote && readOnly && (
          <div className="mt-5 border-2 border-ink bg-surface px-3.5 py-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{myNote.content}</p>
            <p className="mt-1.5 text-xs text-muted">
              내 노트{myNote.isPublic ? ' · 공개됨' : ''}
            </p>
          </div>
        )}

        {othersNotes.length > 0 && (
          <div className="mt-5 flex flex-col gap-2.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              멤버 노트
            </p>
            {othersNotes.map((n) => (
              <div key={n.id} className="border-l-4 border-point bg-point/15 px-4 py-3">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{n.content}</p>
                <p className="mt-2 text-xs font-semibold text-muted-2">{n.author.nickname}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
