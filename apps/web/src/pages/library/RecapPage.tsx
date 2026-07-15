import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMyLibrary } from '@/hooks/useMyLibrary';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { LibraryRecapCard } from '@/components/library/LibraryRecapCard';
import { computeRecap } from '@/components/library/libraryRecap';

export default function RecapPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const libraryQuery = useMyLibrary();

  useEffect(() => {
    if (!isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const stats = libraryQuery.data ? computeRecap(libraryQuery.data) : null;

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <Header />
      <main className="mx-auto max-w-3xl w-full flex-1 px-6 pt-10 page-enter">
        <div className="mb-8">
          <Link
            to="/library"
            className="text-xs font-semibold text-muted hover:text-ink"
          >
            ← 내 서재
          </Link>
          <h1 className="mt-3 text-[clamp(26px,4.5vw,40px)] font-extrabold tracking-tight">
            결산 카드
          </h1>
          <p className="mt-2 text-sm text-muted">
            카드를 스크린샷해서 공유해보세요.
          </p>
        </div>

        {libraryQuery.isLoading && <Skeleton className="mx-auto h-96 max-w-[420px]" />}

        {stats && stats.totalCount === 0 && (
          <EmptyState
            title="아직 결산할 기록이 없어요"
            description="모임이 끝나면 책과 영화가 서재에 쌓여요."
            action={
              <Link to="/orgs">
                <Button variant="primary">내 오가니제이션 보러 가기 →</Button>
              </Link>
            }
          />
        )}

        {stats && stats.totalCount > 0 && <LibraryRecapCard stats={stats} />}
      </main>
      <Footer />
    </div>
  );
}
