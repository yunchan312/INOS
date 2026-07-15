import { useState } from 'react';
import type { LibraryItemDto, UpsertLibraryReviewDto } from '@inos/types';
import { StarRatingInput, formatRating } from './StarRating';

interface BookEditPanelProps {
  item: LibraryItemDto;
  onSave: (dto: UpsertLibraryReviewDto) => void;
  onDelete: () => void;
  onClose: () => void;
  isSaving: boolean;
  isDeleting: boolean;
  hasError: boolean;
}

export function BookEditPanel({
  item,
  onSave,
  onDelete,
  onClose,
  isSaving,
  isDeleting,
  hasError,
}: BookEditPanelProps) {
  const [rating, setRating] = useState(item.review?.rating ?? 0);
  const [comment, setComment] = useState(item.review?.comment ?? '');

  const year = item.finishedAt ? new Date(item.finishedAt).getFullYear() : null;
  const meta = year ? `${item.groupName} · ${year}` : item.groupName;

  return (
    <div className="mt-4 mb-2 max-w-[720px] box-border border-2 border-ink bg-white p-5">
      <p className="mb-4 text-[15px] font-extrabold">
        {item.title}
        {item.creator && (
          <span className="font-normal text-muted"> — {item.creator}</span>
        )}
        <span className="text-xs font-normal text-line"> · {meta}</span>
      </p>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          별점 · 0.5 단위
        </p>
        <span className="text-[13px] font-extrabold">
          {rating > 0 ? formatRating(rating) : '—'}
        </span>
      </div>
      <div className="mt-2">
        <StarRatingInput value={rating} onChange={setRating} sizePx={30} />
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-2">
          <label className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            한줄평
          </label>
          <span className="text-[11px] text-muted">{comment.length}/100</span>
        </div>
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 100))}
          maxLength={100}
          placeholder="이 작품, 한 줄로 남기면…"
          className="input-underline mt-1.5 text-[15px]"
        />
      </div>

      {item.review?.updatedByNickname && (
        <p className="mt-3 text-[11px] text-muted">
          {item.review.updatedByNickname}님이 마지막으로 수정
        </p>
      )}
      {hasError && (
        <p className="mt-3 text-xs text-danger">저장에 실패했어요. 다시 시도해주세요.</p>
      )}

      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => rating >= 1 && onSave({ rating, comment: comment.trim() || null })}
          disabled={rating < 1 || isSaving}
          className="flex min-h-11 cursor-pointer items-center gap-2.5 whitespace-nowrap border-2 border-ink bg-point px-[18px] text-[13px] font-bold text-ink hover:bg-point-hover disabled:cursor-not-allowed disabled:border-line disabled:bg-line disabled:text-muted"
        >
          {isSaving ? <span className="loading loading-spinner loading-sm" /> : '저장'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 cursor-pointer whitespace-nowrap border-2 border-ink bg-transparent px-[18px] text-[13px] font-semibold text-ink hover:bg-ink/[0.06]"
        >
          취소
        </button>
        {item.review && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="ml-auto cursor-pointer border-b border-danger text-xs font-medium text-danger hover:border-danger-2 hover:text-danger-2 disabled:opacity-50"
          >
            리뷰 삭제
          </button>
        )}
      </div>
    </div>
  );
}
