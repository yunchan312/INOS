import { useState, type ReactNode, type UIEvent } from 'react';
import type { LibraryItemDto, UpsertLibraryReviewDto } from '@inos/types';
import { BookSpine } from './BookSpine';
import { BookEditPanel } from './BookEditPanel';

const PAGE_SIZE = 20;

function ShelfBoard() {
  return (
    <>
      <div className="h-3 border-t-2 border-ink bg-[#8a7a5f]" />
      <div className="mx-1.5 h-1 bg-ink" />
    </>
  );
}

interface BookshelfProps {
  books: LibraryItemDto[];
  editingId: string | null;
  onSelect: (meetingId: string) => void;
  onClose: () => void;
  onSave: (meetingId: string, dto: UpsertLibraryReviewDto) => void;
  onDelete: (meetingId: string) => void;
  isSaving: boolean;
  isDeleting: boolean;
  hasError: boolean;
  emptyAction?: ReactNode;
}

export function Bookshelf({
  books,
  editingId,
  onSelect,
  onClose,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  hasError,
  emptyAction,
}: BookshelfProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (books.length === 0) {
    return (
      <div className="max-w-[720px]">
        <div className="flex h-[120px] flex-col items-start justify-end px-6 pb-4">
          <p className="text-base font-bold">아직 책장이 비어 있어요</p>
          <p className="mt-1.5 text-[13px] text-muted">
            모임에서 책을 읽고 나면 이곳에 한 권씩 꽂혀요.
          </p>
        </div>
        <ShelfBoard />
        {emptyAction && <div className="mt-5">{emptyAction}</div>}
      </div>
    );
  }

  const visible = books.slice(0, visibleCount);
  const editingItem = editingId
    ? books.find((b) => b.meetingId === editingId) ?? null
    : null;

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (
      el.scrollLeft + el.clientWidth >= el.scrollWidth - 200 &&
      visibleCount < books.length
    ) {
      setVisibleCount((c) => Math.min(c + PAGE_SIZE, books.length));
    }
  };

  return (
    <div>
      <div className="overflow-x-auto overflow-y-hidden pb-1" onScroll={handleScroll}>
        <div className="min-w-max pt-4">
          <div className="flex items-end gap-1.5 px-3">
            {visible.map((item) => (
              <BookSpine
                key={item.meetingId}
                item={item}
                isEditing={item.meetingId === editingId}
                onClick={() =>
                  item.meetingId === editingId ? onClose() : onSelect(item.meetingId)
                }
              />
            ))}
          </div>
          <ShelfBoard />
        </div>
      </div>
      <p className="mt-2.5 text-xs text-muted">
        {books.length > visibleCount
          ? `${visible.length} / ${books.length}권 · 옆으로 스크롤하면 ${PAGE_SIZE}권씩 더 열려요`
          : `${books.length}권`}
      </p>

      {editingItem && (
        <BookEditPanel
          key={editingItem.meetingId}
          item={editingItem}
          onSave={(dto) => onSave(editingItem.meetingId, dto)}
          onDelete={() => onDelete(editingItem.meetingId)}
          onClose={onClose}
          isSaving={isSaving}
          isDeleting={isDeleting}
          hasError={hasError}
        />
      )}
    </div>
  );
}
