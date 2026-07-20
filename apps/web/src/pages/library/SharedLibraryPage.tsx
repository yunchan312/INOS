import { Link, useParams } from 'react-router-dom';
import { useSharedLibrary } from '@/hooks/useSharedLibrary';
import { Footer } from '@/components/Footer';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { LibraryContent } from '@/components/library/LibraryContent';

const noopMutation = {
  mutate: () => {},
  reset: () => {},
  isPending: false,
  isError: false,
  variables: undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

export default function SharedLibraryPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const query = useSharedLibrary(shareId);

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <header className="sticky top-0 z-40 bg-paper border-b-2 border-ink pt-safe">
        <div className="mx-auto max-w-3xl px-4 h-[60px] flex items-center justify-between">
          <Link to="/" className="flex items-baseline gap-2.5">
            <span className="text-xl font-extrabold tracking-tight">INOS</span>
            <span className="hidden sm:inline text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
              인문학의 OS
            </span>
          </Link>
          <Link to="/">
            <Button variant="primary" size="sm">
              나도 서재 만들기 →
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl w-full flex-1 px-6 pt-10 page-enter">
        {query.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-64" />
          </div>
        )}

        {query.isError && (
          <EmptyState
            title="서가를 찾을 수 없어요"
            description="비공개로 바뀌었거나 잘못된 링크일 수 있어요."
            action={
              <Link to="/">
                <Button variant="primary">INOS 둘러보기</Button>
              </Link>
            }
          />
        )}

        {query.data && (
          <LibraryContent
            kicker="공유된 서가"
            title={
              query.data.scope === 'GROUP'
                ? `${query.data.ownerNickname}의 서가`
                : `${query.data.ownerNickname}님의 서재`
            }
            subtitle={
              query.data.scope === 'GROUP'
                ? '오가니제이션에서 함께 읽고 본 책과 영화 · 별점과 한줄평'
                : 'INOS 모임에서 함께 읽고 본 책과 영화 · 별점과 한줄평'
            }
            library={query.data.library}
            isLoading={false}
            upsertReview={noopMutation}
            deleteReview={noopMutation}
            readOnly
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
