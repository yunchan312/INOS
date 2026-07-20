import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrg } from '@/hooks/useOrg';
import { useOrgInvitations } from '@/hooks/useOrgInvitations';
import { useRevokeInvitation } from '@/hooks/useRevokeInvitation';
import { useUpdateOrgSettings } from '@/hooks/useUpdateOrgSettings';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { Skeleton } from '@/components/Skeleton';
import { InviteEmailInput } from '@/components/InviteEmailInput';

function FieldLabel({ children }: { children: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.12em]">{children}</p>
  );
}

function InputLabel({ children }: { children: string }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted mb-1.5">
      {children}
    </label>
  );
}

export default function OrgSettingsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const orgQuery = useOrg(orgId);
  const updateMutation = useUpdateOrgSettings(orgId);
  const invitationsQuery = useOrgInvitations(orgId);
  const revokeMutation = useRevokeInvitation(orgId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [greeting, setGreeting] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (orgQuery.data) {
      setName(orgQuery.data.name);
      setDescription(orgQuery.data.description ?? '');
      setGreeting(orgQuery.data.greeting ?? '');
    }
  }, [orgQuery.data]);

  useEffect(() => {
    if (orgQuery.data && orgQuery.data.myRole !== 'OWNER') {
      navigate(`/orgs/${orgId}`, { replace: true });
    }
  }, [orgQuery.data, orgId, navigate]);

  const handleSave = () => {
    if (!orgId) return;
    updateMutation.mutate(
      {
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        greeting: greeting.trim() ? greeting.trim() : null,
      },
      { onSuccess: () => setSaved(true) },
    );
  };

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <Header />
      <main className="mx-auto max-w-[760px] w-full flex-1 px-6 pt-10 page-enter">
        <Link
          to={`/orgs/${orgId}`}
          className="text-[13px] font-medium text-muted hover:text-ink"
        >
          ← 오가니제이션으로
        </Link>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          설정
        </p>
        <h1 className="mt-2.5 text-[clamp(28px,5vw,44px)] font-extrabold tracking-tight">
          {orgQuery.data?.name ?? '오가니제이션 설정'}
        </h1>

        {orgQuery.isLoading && (
          <div className="mt-8 space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-24" />
          </div>
        )}

        {orgQuery.data && (
          <div className="mt-8 border-t-2 border-ink">
            <section className="py-7 border-b border-line grid grid-cols-1 sm:grid-cols-[120px_minmax(0,1fr)] gap-4">
              <FieldLabel>기본 정보</FieldLabel>
              <div className="flex flex-col gap-5">
                <div>
                  <InputLabel>이름</InputLabel>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSaved(false);
                    }}
                    className="input-underline text-[15px]"
                  />
                </div>
                <div>
                  <InputLabel>설명</InputLabel>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setSaved(false);
                    }}
                    rows={2}
                    className="input-underline text-[15px] resize-none"
                  />
                </div>
                <div>
                  <InputLabel>초대의 말 — 모임 초대 메일 상단에 표시</InputLabel>
                  <textarea
                    value={greeting}
                    onChange={(e) => {
                      setGreeting(e.target.value);
                      setSaved(false);
                    }}
                    rows={3}
                    placeholder="예: 함께 읽고 이야기하는 시간에 초대해요."
                    className="input-underline text-[15px] resize-none"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    loading={updateMutation.isPending}
                    onClick={handleSave}
                  >
                    저장
                  </Button>
                  {saved && (
                    <span className="text-xs text-muted">저장됨</span>
                  )}
                </div>
              </div>
            </section>

            <section className="py-7 border-b border-line grid grid-cols-1 sm:grid-cols-[120px_minmax(0,1fr)] gap-4">
              <FieldLabel>멤버 초대</FieldLabel>
              <InviteEmailInput orgId={orgQuery.data.id} />
            </section>

            {(invitationsQuery.data?.length ?? 0) > 0 && (
              <section className="py-7 border-b border-line grid grid-cols-1 sm:grid-cols-[120px_minmax(0,1fr)] gap-4">
                <div>
                  <FieldLabel>대기 중인 초대</FieldLabel>
                  <p className="mt-1 text-sm text-muted">
                    {invitationsQuery.data!.length}명
                  </p>
                </div>
                <div>
                  {invitationsQuery.data!.map((inv) => (
                    <div
                      key={inv.id}
                      className="py-3 border-b border-line flex items-center gap-3.5 last:border-b-0"
                    >
                      <span className="w-[34px] h-[34px] border-2 border-dashed border-line text-muted flex items-center justify-center text-[13px] font-bold shrink-0">
                        {inv.email[0]?.toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{inv.email}</p>
                        <p className="text-[11px] text-muted">
                          {new Date(inv.expiresAt).toLocaleDateString('ko-KR')}{' '}
                          까지 유효
                        </p>
                      </div>
                      <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                        대기 중
                      </span>
                      <button
                        type="button"
                        onClick={() => revokeMutation.mutate(inv.id)}
                        disabled={revokeMutation.isPending}
                        className="text-xs font-medium text-danger border-b border-danger hover:text-danger-2 hover:border-danger-2 disabled:opacity-50"
                      >
                        취소
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="py-7 border-b-2 border-ink grid grid-cols-1 sm:grid-cols-[120px_minmax(0,1fr)] gap-4">
              <div>
                <FieldLabel>현재 멤버</FieldLabel>
                <p className="mt-1 text-sm text-muted">
                  {orgQuery.data.members.length}명
                </p>
              </div>
              <div>
                {orgQuery.data.members.map((m) => (
                  <div
                    key={m.id}
                    className="py-3 border-b border-line flex items-center gap-3.5 last:border-b-0"
                  >
                    {m.profileImageUrl ? (
                      <img
                        src={m.profileImageUrl}
                        alt={m.nickname}
                        className="w-[34px] h-[34px] object-cover border-2 border-ink shrink-0"
                      />
                    ) : (
                      <div className="w-[34px] h-[34px] bg-ink text-point flex items-center justify-center text-[13px] font-bold shrink-0">
                        {m.nickname[0]}
                      </div>
                    )}
                    <span className="flex-1 text-sm font-medium">
                      {m.nickname}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
                      {m.role === 'OWNER' ? '소유자' : '멤버'}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
