import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrg } from '@/hooks/useOrg';
import {
  useDeleteOrgPost,
  useOrgPost,
  useToggleOrgPostLike,
} from '@/hooks/useOrgPosts';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { Markdown } from '@/components/Markdown';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`;
}

export default function OrgPostDetailPage() {
  const { orgId, postId } = useParams<{ orgId: string; postId: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const orgQuery = useOrg(orgId);
  const postQuery = useOrgPost(orgId, postId);
  const toggleLike = useToggleOrgPostLike(orgId);
  const deletePost = useDeleteOrgPost(orgId);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const post = postQuery.data;
  const isOwner = orgQuery.data?.myRole === 'OWNER';
  const canManage = !!post && (user?.id === post.authorId || isOwner);

  const handleDelete = () => {
    if (!postId) return;
    deletePost.mutate(postId, {
      onSuccess: () => navigate(`/orgs/${orgId}`),
    });
  };

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <Header />
      <main className="mx-auto max-w-3xl w-full flex-1 px-6 pt-10 page-enter">
        <Link
          to={`/orgs/${orgId}`}
          className="text-[13px] font-medium text-muted hover:text-ink"
        >
          ← 오가니제이션으로
        </Link>

        {postQuery.isLoading && (
          <div className="mt-8 space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-40" />
          </div>
        )}

        {postQuery.isError && (
          <div className="mt-8">
            <EmptyState
              title="글을 찾을 수 없어요"
              action={
                <Button variant="ghost" onClick={() => navigate(`/orgs/${orgId}`)}>
                  돌아가기
                </Button>
              }
            />
          </div>
        )}

        {post && (
          <article className="pb-12">
            <div className="mt-6 border-b-2 border-ink pb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                하고싶은 말
              </p>
              <h1 className="mt-3 text-[clamp(26px,4.5vw,40px)] font-extrabold leading-[1.2] tracking-tight break-keep">
                {post.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                <span className="font-semibold text-ink">{post.authorNickname}</span>
                <span>{formatDateTime(post.createdAt)}</span>
                {post.updatedAt !== post.createdAt && <span>· 수정됨</span>}

                {canManage && (
                  <span className="ml-auto flex items-center gap-3 text-xs">
                    {confirmingDelete ? (
                      <>
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={deletePost.isPending}
                          className="font-medium text-danger border-b border-danger hover:text-danger-2 hover:border-danger-2 disabled:opacity-50"
                        >
                          {deletePost.isPending ? '삭제 중…' : '정말 삭제'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingDelete(false)}
                          className="font-medium text-muted border-b border-muted hover:text-ink hover:border-ink"
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to={`/orgs/${orgId}/posts/${post.id}/edit`}
                          className="font-medium text-muted border-b border-muted hover:text-ink hover:border-ink"
                        >
                          수정
                        </Link>
                        <button
                          type="button"
                          onClick={() => setConfirmingDelete(true)}
                          className="font-medium text-danger border-b border-danger hover:text-danger-2 hover:border-danger-2"
                        >
                          삭제
                        </button>
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-8">
              <Markdown content={post.content} />
            </div>

            {/* 좋아요 */}
            <div className="mt-10 flex justify-center border-t border-line pt-8">
              <button
                type="button"
                onClick={() => toggleLike.mutate(post.id)}
                disabled={toggleLike.isPending}
                aria-pressed={post.likedByMe}
                className={[
                  'flex items-center gap-2.5 border-2 border-ink px-5 py-2.5 text-sm font-bold transition-colors',
                  post.likedByMe
                    ? 'bg-point text-on-accent hover:bg-point-hover'
                    : 'bg-paper text-ink hover:bg-surface',
                ].join(' ')}
              >
                <span aria-hidden="true">{post.likedByMe ? '♥' : '♡'}</span>
                좋아요 {post.likeCount > 0 && post.likeCount}
              </button>
            </div>

            {deletePost.isError && (
              <p className="mt-3 text-center text-xs text-danger">
                삭제에 실패했어요. 다시 시도해주세요.
              </p>
            )}
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}
