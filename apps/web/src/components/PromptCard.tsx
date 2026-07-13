import { useEffect, useRef, useState, useCallback } from 'react';
import type { DiscussionNoteDto, PromptKind } from '@inos/types';

interface PromptCardProps {
  prompt: string;
  promptKind: PromptKind;
  questionIndex: number;
  myNote: DiscussionNoteDto | undefined;
  publicNotes: DiscussionNoteDto[];
  readOnly: boolean;
  onSave: (dto: { promptKind: PromptKind; questionIndex: number; content: string; isPublic: boolean }) => void;
}

export function PromptCard({
  prompt,
  promptKind,
  questionIndex,
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
    <div className="border border-neutral-200 rounded-xl p-4 space-y-3 bg-white">
      <p className="text-sm font-medium text-neutral-900 leading-relaxed">
        Q{questionIndex + 1}. {prompt}
      </p>

      {!readOnly && (
        <div className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="내 생각을 적어보세요…"
            rows={3}
            className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={handlePublicToggle}
                className="rounded border-neutral-300 text-neutral-900 focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-xs text-neutral-500">멤버에게 공개</span>
            </label>
            {content.trim() && (
              <span className="text-xs text-neutral-400">자동 저장됨</span>
            )}
          </div>
        </div>
      )}

      {myNote && readOnly && (
        <div className="bg-neutral-50 rounded-lg px-3 py-2">
          <p className="text-sm text-neutral-700 whitespace-pre-wrap">{myNote.content}</p>
          <p className="mt-1 text-xs text-neutral-400">
            내 노트{myNote.isPublic ? ' · 공개됨' : ''}
          </p>
        </div>
      )}

      {othersNotes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-neutral-400 font-medium">멤버 노트</p>
          {othersNotes.map((n) => (
            <div key={n.id} className="bg-[color:var(--color-point)]/10 rounded-lg px-3 py-2">
              <p className="text-sm text-neutral-700 whitespace-pre-wrap">{n.content}</p>
              <p className="mt-1 text-xs text-neutral-500">{n.author.nickname}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
