import type { LibraryItemDto, UpsertLibraryReviewDto } from '@inos/types';
import { MoviePosterCard } from './MoviePosterCard';

interface MoviePosterGridProps {
  movies: LibraryItemDto[];
  readOnly?: boolean;
  editingId: string | null;
  onSelect: (meetingId: string) => void;
  onClose: () => void;
  onSave: (meetingId: string, dto: UpsertLibraryReviewDto) => void;
  onDelete: (meetingId: string) => void;
  onDeleteEntry?: (entryId: string) => void;
  isSaving: boolean;
  isDeleting: boolean;
  hasError: boolean;
}

export function MoviePosterGrid({
  movies,
  readOnly = false,
  editingId,
  onSelect,
  onClose,
  onSave,
  onDelete,
  onDeleteEntry,
  isSaving,
  isDeleting,
  hasError,
}: MoviePosterGridProps) {
  if (movies.length === 0) {
    return (
      <div className="max-w-[720px] box-border border-2 border-ink px-6 py-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(32,30,29,0.04)_10px,rgba(32,30,29,0.04)_12px)]">
        <p className="text-base font-bold">아직 함께 본 영화가 없어요</p>
        <p className="mt-1.5 text-[13px] text-muted">
          영화 모임이 끝나면 포스터가 이곳에 걸려요.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
      {movies.map((item) => (
        <div key={item.meetingId} className="relative">
          <MoviePosterCard
            item={item}
            readOnly={readOnly}
            isEditing={item.meetingId === editingId}
            onSelect={() => onSelect(item.meetingId)}
            onClose={onClose}
            onSave={(dto) => onSave(item.meetingId, dto)}
            onDelete={() => onDelete(item.meetingId)}
            onDeleteEntry={
              item.source === 'MANUAL' && onDeleteEntry
                ? () => onDeleteEntry(item.meetingId)
                : undefined
            }
            isSaving={isSaving}
            isDeleting={isDeleting}
            hasError={hasError}
          />
        </div>
      ))}
    </div>
  );
}
