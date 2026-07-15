import { useState } from 'react';
import type { LibraryItemDto, UpsertLibraryReviewDto } from '@inos/types';
import { StarRating, StarRatingInput, formatRating } from './StarRating';
import { pickSpineColor } from './libraryPalette';

interface MoviePosterCardProps {
  item: LibraryItemDto;
  isEditing: boolean;
  onSelect: () => void;
  onClose: () => void;
  onSave: (dto: UpsertLibraryReviewDto) => void;
  onDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
  hasError: boolean;
}

export function MoviePosterCard({
  item,
  isEditing,
  onSelect,
  onClose,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  hasError,
}: MoviePosterCardProps) {
  if (isEditing) {
    return (
      <MoviePosterEditCard
        key={item.meetingId}
        item={item}
        onSave={onSave}
        onDelete={onDelete}
        onClose={onClose}
        isSaving={isSaving}
        isDeleting={isDeleting}
        hasError={hasError}
      />
    );
  }

  const bg = pickSpineColor(item.meetingId);
  const year = item.finishedAt ? new Date(item.finishedAt).getFullYear() : null;

  // 버튼(히트 영역)은 고정하고 내부만 scale해서 hover 경계 지터로 인한 끊김을 방지한다.
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative block w-full cursor-pointer hover:z-[2]"
    >
      <span
        className="flex aspect-[2/3] w-full flex-col box-border border-2 border-ink p-4 text-left text-on-accent transition-[transform,box-shadow] duration-150 ease-out will-change-transform group-hover:scale-[1.03] group-hover:shadow-[var(--lift-shadow-lg)]"
        style={{ backgroundColor: bg }}
      >
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-70">
        Film{year ? ` · ${year}` : ''}
      </span>
      <span className="mt-auto block">
        <span className="block break-keep text-[19px] font-extrabold leading-[1.15] tracking-[-0.01em]">
          {item.title}
        </span>
        {item.creator && (
          <span className="mt-1.5 block text-[11px] font-medium opacity-80">
            {item.creator}
          </span>
        )}
      </span>
      <span className="mt-3.5 block border-t-[1.5px] border-on-accent/35 pt-2.5">
        {item.review ? (
          <>
            <span className="flex items-center gap-1.5">
              <StarRating value={item.review.rating} sizePx={12} />
              <span className="text-[11px] font-extrabold">
                {formatRating(item.review.rating)}
              </span>
            </span>
            {item.review.comment && (
              <span className="mt-1.5 line-clamp-2 block text-[11px] leading-[1.5] opacity-85">
                “{item.review.comment}”
              </span>
            )}
          </>
        ) : (
          <span className="inline-block whitespace-nowrap border-[1.5px] border-on-accent px-[7px] py-[3px] text-[10px] font-bold uppercase tracking-[0.1em]">
            리뷰 남기기
          </span>
        )}
      </span>
      </span>
    </button>
  );
}

interface MoviePosterEditCardProps {
  item: LibraryItemDto;
  onSave: (dto: UpsertLibraryReviewDto) => void;
  onDelete: () => void;
  onClose: () => void;
  isSaving: boolean;
  isDeleting: boolean;
  hasError: boolean;
}

function MoviePosterEditCard({
  item,
  onSave,
  onDelete,
  onClose,
  isSaving,
  isDeleting,
  hasError,
}: MoviePosterEditCardProps) {
  const [rating, setRating] = useState(item.review?.rating ?? 0);
  const [comment, setComment] = useState(item.review?.comment ?? '');

  return (
    <div className="flex aspect-[2/3] box-border flex-col border-2 border-ink bg-surface p-4 text-left">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
        리뷰 편집
      </span>
      <span className="mt-2 break-keep text-[15px] font-extrabold leading-[1.2]">
        {item.title}
      </span>
      <div className="mt-3 flex items-center gap-px">
        <StarRatingInput value={rating} onChange={setRating} sizePx={22} />
        <span className="ml-1.5 text-xs font-extrabold">
          {rating > 0 ? formatRating(rating) : '—'}
        </span>
      </div>
      <textarea
        rows={3}
        maxLength={100}
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 100))}
        placeholder="한줄평 (100자)"
        className="mt-3 w-full box-border resize-none border-2 border-ink bg-surface-2 p-2 text-xs leading-[1.5] outline-none focus:border-point-hover"
      />
      <span className="mt-1 flex items-center justify-between text-[10px] text-muted">
        {item.review ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="cursor-pointer border-b border-danger font-medium text-danger hover:border-danger-2 hover:text-danger-2 disabled:opacity-50"
          >
            삭제
          </button>
        ) : (
          <span />
        )}
        <span>{comment.length}/100</span>
      </span>
      {hasError && (
        <span className="mt-1 block text-[10px] text-danger">저장 실패. 다시 시도해주세요.</span>
      )}
      <div className="mt-auto flex gap-1.5">
        <button
          type="button"
          onClick={() => rating >= 1 && onSave({ rating, comment: comment.trim() || null })}
          disabled={rating < 1 || isSaving}
          className="min-h-[38px] flex-1 cursor-pointer whitespace-nowrap border-2 border-ink bg-point px-3 text-left text-xs font-bold text-on-accent hover:bg-point-hover disabled:cursor-not-allowed disabled:border-line disabled:bg-line disabled:text-muted"
        >
          {isSaving ? '저장 중…' : '저장'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[38px] cursor-pointer whitespace-nowrap border-2 border-ink bg-transparent px-3 text-xs font-semibold text-ink hover:bg-ink/[0.06]"
        >
          취소
        </button>
      </div>
    </div>
  );
}
