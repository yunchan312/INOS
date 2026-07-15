import { useState, type ReactNode } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { LibraryDto, PromptKind, UpsertLibraryReviewDto } from '@inos/types';
import { Bookshelf } from './Bookshelf';
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
}: LibraryContentProps) {
  const [editing, setEditing] = useState<Editing | null>(null);

  const openEditor = (kind: PromptKind) => (meetingId: string) => {
    upsertReview.reset();
    deleteReview.reset();
    setEditing({ kind, meetingId });
  };
  const closeEditor = () => setEditing(null);

  const saveReview = (kind: PromptKind) => (meetingId: string, dto: UpsertLibraryReviewDto) => {
    upsertReview.mutate(
      { meetingId, kind, dto },
      { onSuccess: closeEditor },
    );
  };
  const removeReview = (kind: PromptKind) => (meetingId: string) => {
    deleteReview.mutate(
      { meetingId, kind },
      { onSuccess: closeEditor },
    );
  };

  const editingIdOf = (kind: PromptKind) =>
    editing?.kind === kind ? editing.meetingId : null;
  const hasError = upsertReview.isError || deleteReview.isError;

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
              isSaving={upsertReview.isPending}
              isDeleting={deleteReview.isPending}
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
              editingId={editingIdOf('MOVIE')}
              onSelect={openEditor('MOVIE')}
              onClose={closeEditor}
              onSave={saveReview('MOVIE')}
              onDelete={removeReview('MOVIE')}
              isSaving={upsertReview.isPending}
              isDeleting={deleteReview.isPending}
              hasError={hasError && editing?.kind === 'MOVIE'}
            />
          </section>
        </>
      )}
    </>
  );
}
