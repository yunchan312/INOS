import { useState } from 'react';
import type { CreateManualLibraryEntryDto, PromptKind } from '@inos/types';
import { Button } from '@/components/Button';
import { BookSearchInput, type BookSelection } from '@/components/BookSearchInput';
import { MovieSearchInput, type MovieSelection } from '@/components/MovieSearchInput';

/** 검색해서 고른 작품이든 직접 적은 작품이든, 서가는 제목+지은이만 받는다 */
function toEntry(
  kind: PromptKind,
  book: BookSelection | null,
  movie: MovieSelection | null,
): { title: string; creator: string | null } | null {
  const work = kind === 'BOOK' ? book : movie;
  if (!work) return null;
  const title = work.title.trim();
  if (!title) return null;
  // 책은 author, 영화는 director — 서가에서는 둘 다 "지은이" 한 칸이다
  const creator = 'author' in work ? work.author : work.director;
  return { title, creator: creator?.trim() || null };
}

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
  // 책/영화를 따로 들고 있어서, 탭을 잘못 눌렀다 돌아와도 고른 게 날아가지 않는다
  const [book, setBook] = useState<BookSelection | null>(null);
  const [movie, setMovie] = useState<MovieSelection | null>(null);
  const [finishedAt, setFinishedAt] = useState('');
  const [discussionText, setDiscussionText] = useState('');

  const entry = toEntry(kind, book, movie);

  const handleSubmit = () => {
    if (!entry) return;
    onSubmit({
      kind,
      title: entry.title,
      creator: entry.creator,
      finishedAt: finishedAt || null,
      discussionText: discussionText.trim() || null,
    });
  };

  return (
    <div className="mt-6 border border-line rounded-card bg-surface p-5">
      <p className="text-sm font-bold">책/영화 직접 추가</p>
      <p className="mt-1 text-xs text-muted">
        모임 없이 혼자 읽고 본 것도 서가에 꽂을 수 있어요.
      </p>

      <div className="mt-4 flex gap-0 overflow-hidden border border-line rounded-ui w-fit">
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

      <div className="mt-4 flex flex-col gap-4">
        {kind === 'BOOK' ? (
          <BookSearchInput
            value={book}
            onChange={setBook}
            variant="boxed"
            label="제목 (필수)"
            placeholder="예: 데미안"
          />
        ) : (
          <MovieSearchInput
            value={movie}
            onChange={setMovie}
            variant="boxed"
            label="제목 (필수)"
            placeholder="예: 기생충"
          />
        )}
        <div className="sm:max-w-[220px]">
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
          className="mt-1 w-full box-border resize-y border border-line rounded-ui bg-surface-2 p-3 text-sm leading-relaxed outline-none focus:border-ink"
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
          disabled={!entry}
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
