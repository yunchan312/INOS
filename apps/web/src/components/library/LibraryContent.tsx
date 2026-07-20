import { useState, type ReactNode } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type {
  CreateManualLibraryEntryDto,
  LibraryDto,
  PromptKind,
  UpdateManualLibraryEntryDto,
  UpsertLibraryReviewDto,
} from '@inos/types';
import { Bookshelf } from './Bookshelf';
import { ManualEntryForm } from './ManualEntryForm';
import { MoviePosterGrid } from './MoviePosterGrid';
import { SectionLabel } from '@/components/SectionLabel';
import { Skeleton } from '@/components/Skeleton';

interface ReviewMutationVars {
  meetingId: string;
  kind: PromptKind;
}

interface Editing {
  kind: PromptKind;
  meetingId: string;
}

interface LibraryContentProps {
  kicker: string;
  title: string;
  subtitle: string;
  library: LibraryDto | undefined;
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upsertReview: UseMutationResult<any, unknown, ReviewMutationVars & { dto: UpsertLibraryReviewDto }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deleteReview: UseMutationResult<any, unknown, ReviewMutationVars>;
  emptyBooksAction?: ReactNode;
  /** 공유(공개) 뷰에서 true — 리뷰 편집기를 열지 않는다 */
  readOnly?: boolean;
  /** 개인 서재에서만 — 수기 항목 등록/수정/삭제 뮤테이션 */
  manualEntry?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create: UseMutationResult<any, unknown, CreateManualLibraryEntryDto>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update: UseMutationResult<any, unknown, { entryId: string; dto: UpdateManualLibraryEntryDto }>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    remove: UseMutationResult<any, unknown, string>;
  };
}

export function LibraryContent({
  kicker,
  title,
  subtitle,
  library,
  isLoading,
  upsertReview,
  deleteReview,
  emptyBooksAction,
  readOnly = false,
  manualEntry,
}: LibraryContentProps) {
  const [editing, setEditing] = useState<Editing | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);

  const findItem = (kind: PromptKind, id: string) =>
    (kind === 'BOOK' ? library?.books : library?.movies)?.find(
      (i) => i.meetingId === id,
    );

  const openEditor = (kind: PromptKind) => (meetingId: string) => {
    if (readOnly) return;
    upsertReview.reset();
    deleteReview.reset();
    setEditing({ kind, meetingId });
  };
  const closeEditor = () => setEditing(null);

  const saveReview = (kind: PromptKind) => (meetingId: string, dto: UpsertLibraryReviewDto) => {
    const item = findItem(kind, meetingId);
    if (item?.source === 'MANUAL' && manualEntry) {
      manualEntry.update.mutate(
        {
          entryId: meetingId,
          dto: { rating: dto.rating, comment: dto.comment ?? null },
        },
        { onSuccess: closeEditor },
      );
      return;
    }
    upsertReview.mutate(
      { meetingId, kind, dto },
      { onSuccess: closeEditor },
    );
  };
  const removeReview = (kind: PromptKind) => (meetingId: string) => {
    const item = findItem(kind, meetingId);
    if (item?.source === 'MANUAL' && manualEntry) {
      manualEntry.update.mutate(
        { entryId: meetingId, dto: { rating: null, comment: null } },
        { onSuccess: closeEditor },
      );
      return;
    }
    deleteReview.mutate(
      { meetingId, kind },
      { onSuccess: closeEditor },
    );
  };
  const deleteEntry = (entryId: string) => {
    manualEntry?.remove.mutate(entryId, { onSuccess: closeEditor });
  };

  const editingIdOf = (kind: PromptKind) =>
    editing?.kind === kind ? editing.meetingId : null;
  const isSaving = upsertReview.isPending || (manualEntry?.update.isPending ?? false);
  const isDeleting =
    deleteReview.isPending || (manualEntry?.remove.isPending ?? false);
  const hasError =
    upsertReview.isError ||
    deleteReview.isError ||
    (manualEntry?.update.isError ?? false) ||
    (manualEntry?.remove.isError ?? false);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-6">
        <div>
          <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {kicker}
          </p>
          <h1 className="mt-2.5 text-[clamp(30px,5vw,48px)] font-extrabold tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
        </div>
        {library && (
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-2xl font-extrabold leading-none">{library.books.length}</p>
              <p className="mt-1 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                책
              </p>
            </div>
            <div>
              <p className="text-2xl font-extrabold leading-none">{library.movies.length}</p>
              <p className="mt-1 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                영화
              </p>
            </div>
          </div>
        )}
      </div>

      {manualEntry &&
        !readOnly &&
        (showManualForm ? (
          <ManualEntryForm
            onSubmit={(dto: CreateManualLibraryEntryDto) =>
              manualEntry.create.mutate(dto, {
                onSuccess: () => setShowManualForm(false),
              })
            }
            onClose={() => setShowManualForm(false)}
            isSaving={manualEntry.create.isPending}
            hasError={manualEntry.create.isError}
          />
        ) : (
          <div className="mt-4 text-right">
            <button
              type="button"
              onClick={() => setShowManualForm(true)}
              className="text-[13px] font-semibold text-ink border-b border-ink hover:text-muted-2 hover:border-muted-2"
            >
              + 책/영화 직접 추가
            </button>
          </div>
        ))}

      {isLoading ? (
        <div className="mt-10 space-y-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-11" />
        </div>
      ) : (
        <>
          <section className="mt-10">
            <SectionLabel num="01" hint="함께 읽은 책">
              책장
            </SectionLabel>
            <Bookshelf
              books={library?.books ?? []}
              editingId={editingIdOf('BOOK')}
              onSelect={openEditor('BOOK')}
              onClose={closeEditor}
              onSave={saveReview('BOOK')}
              onDelete={removeReview('BOOK')}
              onDeleteEntry={manualEntry ? deleteEntry : undefined}
              isSaving={isSaving}
              isDeleting={isDeleting}
              hasError={hasError && editing?.kind === 'BOOK'}
              emptyAction={emptyBooksAction}
            />
          </section>

          <section className="mt-14">
            <SectionLabel num="02" hint="함께 본 영화">
              필름
            </SectionLabel>
            <MoviePosterGrid
              movies={library?.movies ?? []}
              readOnly={readOnly}
              editingId={editingIdOf('MOVIE')}
              onSelect={openEditor('MOVIE')}
              onClose={closeEditor}
              onSave={saveReview('MOVIE')}
              onDelete={removeReview('MOVIE')}
              onDeleteEntry={manualEntry ? deleteEntry : undefined}
              isSaving={isSaving}
              isDeleting={isDeleting}
              hasError={hasError && editing?.kind === 'MOVIE'}
            />
          </section>
        </>
      )}
    </>
  );
}
