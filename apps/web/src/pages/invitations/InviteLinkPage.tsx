import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { groupApi } from '@/api/endpoints/group';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';

const RETURN_TO_KEY = 'inos.auth.returnTo';

// 링크 초대 수락 — 이메일 초대와 달리 로그인한 누구나 참여 가능
export default function InviteLinkPage() {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const preview = useQuery({
    queryKey: ['invite-link-preview', token],
    queryFn: () => groupApi.getInviteLinkPreview(token as string),
    enabled: !!token,
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: () => groupApi.acceptInviteLink(token as string),
  });

  useEffect(() => {
    if (!isAuthenticated && token) {
      window.sessionStorage.setItem(RETURN_TO_KEY, `/invite/${token}`);
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, token, navigate]);

  const handleAccept = () => {
    acceptMutation.mutate(undefined, {
      onSuccess: (data) => navigate(`/orgs/${data.groupId}`, { replace: true }),
    });
  };

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
            title="초대 링크를 찾을 수 없어요"
            description="링크가 잘못됐거나 철회된 초대예요."
            action={
              <Button variant="ghost" onClick={() => navigate('/orgs')}>
                오가니제이션으로
              </Button>
            }
          />
        )}

        {preview.data && (
          <Card>
            <div className="py-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {preview.data.inviterName}님이 초대했어요
              </p>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
                「{preview.data.groupName}」
              </h1>
              <p className="mt-3 text-sm text-muted">
                현재 멤버 {preview.data.memberCount}명 · 함께 읽고, 보고,
                생각하는 모임
              </p>

              {preview.data.expired ? (
                <p className="mt-6 text-sm font-medium text-danger">
                  이 초대 링크는 만료됐어요. 초대한 분에게 새 링크를 요청해주세요.
                </p>
              ) : (
                <div className="mt-7">
                  <Button
                    variant="primary"
                    size="lg"
                    loading={acceptMutation.isPending}
                    onClick={handleAccept}
                  >
                    참여하기 →
                  </Button>
                </div>
              )}

              {acceptMutation.isError && (
                <p className="mt-3 text-xs text-danger">
                  참여에 실패했어요. 링크가 만료됐을 수 있어요.
                </p>
              )}
            </div>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
