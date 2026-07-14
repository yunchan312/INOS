import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInvitationPreview } from '@/hooks/useInvitationPreview';
import { useAcceptInvitation } from '@/hooks/useAcceptInvitation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';

const RETURN_TO_KEY = 'inos.auth.returnTo';

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const preview = useInvitationPreview(token);
  const acceptMutation = useAcceptInvitation();

  useEffect(() => {
    if (!isAuthenticated && token) {
      window.sessionStorage.setItem(RETURN_TO_KEY, `/invitations/${token}`);
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, token, navigate]);

  const handleAccept = () => {
    if (!token) return;
    acceptMutation.mutate(token, {
      onSuccess: (data) => navigate(`/orgs/${data.groupId}`, { replace: true }),
    });
  };

  const isExpired = preview.data?.status === 'EXPIRED';
  const isAccepted = preview.data?.status === 'ACCEPTED';
  const isRevoked = preview.data?.status === 'REVOKED';

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <Header />
      <main className="mx-auto max-w-lg w-full flex-1 px-6 pt-10 page-enter">
        {preview.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-24" />
          </div>
        )}

        {preview.isError && (
          <EmptyState
            title="초대장을 찾을 수 없어요"
            description="링크가 만료되었거나 잘못된 초대장이에요."
            action={
              <Button variant="ghost" onClick={() => navigate('/orgs')}>
                오가니제이션으로
              </Button>
            }
          />
        )}

        {preview.data && (
          <Card>
            <div className="text-center py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {preview.data.inviterName}님이 초대했어요
              </p>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
                「{preview.data.groupName}」
              </h1>
              <p className="mt-3 text-sm text-muted">
                {preview.data.inviteeEmail}
              </p>

              {isExpired && (
                <p className="mt-6 text-sm font-medium text-danger">
                  이 초대장은 만료되었어요.
                </p>
              )}
              {isRevoked && (
                <p className="mt-6 text-sm font-medium text-danger">
                  이 초대장은 취소되었어요.
                </p>
              )}
              {isAccepted && (
                <p className="mt-6 text-sm text-muted">
                  이미 수락한 초대장이에요.
                </p>
              )}

              {preview.data.status === 'PENDING' && (
                <div className="mt-6">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={acceptMutation.isPending}
                    onClick={handleAccept}
                  >
                    <span>참여하기</span>
                    <span aria-hidden="true">→</span>
                  </Button>
                  {acceptMutation.isError && (
                    <p className="mt-3 text-xs text-danger">
                      수락에 실패했어요. 초대받은 이메일로 로그인했는지 확인해주세요.
                    </p>
                  )}
                </div>
              )}

              {(isAccepted || isExpired || isRevoked) && (
                <div className="mt-6">
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => navigate('/orgs')}
                  >
                    오가니제이션으로
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
