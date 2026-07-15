import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrg } from '@/hooks/useOrg';
import { useOrgLibrary } from '@/hooks/useOrgLibrary';
import { useUpsertGroupReview } from '@/hooks/useUpsertGroupReview';
import { useDeleteGroupReview } from '@/hooks/useDeleteGroupReview';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Skeleton } from '@/components/Skeleton';
import { Button } from '@/components/Button';
import { LibraryContent } from '@/components/library/LibraryContent';

export default function OrgLibraryPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const orgQuery = useOrg(orgId);
  const libraryQuery = useOrgLibrary(orgId);
  const upsertReview = useUpsertGroupReview(orgId);
  const deleteReview = useDeleteGroupReview(orgId);

  useEffect(() => {
    if (!isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <Header />
      <main className="mx-auto max-w-3xl w-full flex-1 px-6 pt-10 page-enter">
        {orgQuery.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        )}

        {orgQuery.data && (
          <>
            <Link
              to={`/orgs/${orgId}`}
              className="mb-4 inline-block text-xs font-semibold text-muted hover:text-ink"
            >
              ← {orgQuery.data.name}
            </Link>
            <LibraryContent
              kicker={`${orgQuery.data.name} — 라이브러리`}
              title="우리가 쌓은 서가"
              subtitle={`${orgQuery.data.name}에서 함께 읽고 본 모든 것 · 별점과 한줄평`}
              library={libraryQuery.data}
              isLoading={libraryQuery.isLoading}
              upsertReview={upsertReview}
              deleteReview={deleteReview}
              emptyBooksAction={
                orgQuery.data.myRole === 'OWNER' ? (
                  <Link to={`/orgs/${orgId}/meetings/new`}>
                    <Button variant="primary" size="md">
                      첫 모임 만들기 →
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
