import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCreateOrgPost, useOrgPost, useUpdateOrgPost } from '@/hooks/useOrgPosts';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { Skeleton } from '@/components/Skeleton';
import { MarkdownEditor } from '@/components/MarkdownEditor';

// 하고싶은 말 등록/수정 폼 — postId 파라미터가 있으면 수정 모드
export default function OrgPostFormPage() {
  const { orgId, postId } = useParams<{ orgId: string; postId?: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isEdit = !!postId;

  const postQuery = useOrgPost(orgId, postId);
  const createPost = useCreateOrgPost(orgId);
  const updatePost = useUpdateOrgPost(orgId, postId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  // 수정 모드: 기존 글 프리필
  useEffect(() => {
    if (isEdit && postQuery.data) {
      setTitle(postQuery.data.title);
      setContent(postQuery.data.content);
    }
  }, [isEdit, postQuery.data]);

  const mutation = isEdit ? updatePost : createPost;
  const canSubmit = !!title.trim() && !!content.trim() && !mutation.isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const dto = { title: title.trim(), content };
    const options = {
      // 등록하면 다시 오가니제이션으로, 수정하면 상세로
      onSuccess: () =>
        navigate(isEdit ? `/orgs/${orgId}/posts/${postId}` : `/orgs/${orgId}`),
    };
    if (isEdit) updatePost.mutate(dto, options);
    else createPost.mutate(dto, options);
  };

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <Header />
      <main className="mx-auto max-w-3xl w-full flex-1 px-6 pt-10 page-enter">
        <Link
          to={isEdit ? `/orgs/${orgId}/posts/${postId}` : `/orgs/${orgId}`}
          className="text-[13px] font-medium text-muted hover:text-ink"
        >
          ← 돌아가기
        </Link>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          하고싶은 말
        </p>
        <h1 className="mt-2.5 text-[clamp(28px,5vw,44px)] font-extrabold leading-[1.15] tracking-tight">
          {isEdit ? '글 수정하기' : '글 남기기'}
        </h1>

        {isEdit && postQuery.isLoading ? (
          <div className="mt-8 space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-64" />
          </div>
        ) : (
          <div className="mt-8 space-y-5 pb-12">
            <div>
              <label
                htmlFor="post-title"
                className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted"
              >
                제목
              </label>
              <input
                id="post-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                maxLength={100}
                placeholder="제목을 입력해주세요"
                className="input-underline text-lg font-semibold"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                내용
              </label>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder={
                  '자유롭게 적어보세요.\n\n툴바 버튼으로 제목/굵게/하이라이트 같은 스타일을 쓸 수 있어요.'
                }
              />
            </div>

            {mutation.isError && (
              <p className="text-xs text-danger">
                저장에 실패했어요. 다시 시도해주세요.
              </p>
            )}

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="lg"
                loading={mutation.isPending}
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                {isEdit ? '수정 완료' : '등록하기'}
              </Button>
              <Button variant="ghost" size="lg" onClick={() => navigate(-1)}>
                취소
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
