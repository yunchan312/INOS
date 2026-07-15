import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMyLibrary } from '@/hooks/useMyLibrary';
import { useUpsertMyReview } from '@/hooks/useUpsertMyReview';
import { useDeleteMyReview } from '@/hooks/useDeleteMyReview';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { LibraryContent } from '@/components/library/LibraryContent';
import { LibraryShareBar } from '@/components/library/LibraryShareBar';

export default function MyLibraryPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const libraryQuery = useMyLibrary();
  const upsertReview = useUpsertMyReview();
  const deleteReview = useDeleteMyReview();

  useEffect(() => {
    if (!isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <Header />
      <main className="mx-auto max-w-3xl w-full flex-1 px-6 pt-10 page-enter">
        <LibraryContent
          kicker="라이브러리"
          title="내가 쌓은 서가"
          subtitle="내가 참여한 모임에서 함께 읽고 본 모든 것 · 별점과 한줄평"
          library={libraryQuery.data}
          isLoading={libraryQuery.isLoading}
          upsertReview={upsertReview}
          deleteReview={deleteReview}
          emptyBooksAction={
            <Link to="/orgs">
              <Button variant="primary" size="md">
                내 오가니제이션 보러 가기 →
              </Button>
            </Link>
          }
        />
        <LibraryShareBar />
        <div className="mt-4">
          <Link to="/library/recap">
            <Button variant="outline" size="md" fullWidth>
              <span>{new Date().getFullYear()} 결산 카드 보기</span>
              <span aria-hidden="true">→</span>
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
