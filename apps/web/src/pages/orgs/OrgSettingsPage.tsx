import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrg } from '@/hooks/useOrg';
import { useUpdateOrgSettings } from '@/hooks/useUpdateOrgSettings';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Skeleton } from '@/components/Skeleton';
import { InviteEmailInput } from '@/components/InviteEmailInput';

export default function OrgSettingsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const orgQuery = useOrg(orgId);
  const updateMutation = useUpdateOrgSettings(orgId);

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
    <div className="min-h-dvh bg-neutral-50">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pt-6 pb-safe page-enter">
        <Link
          to={`/orgs/${orgId}`}
          className="text-sm text-neutral-500 hover:text-neutral-800"
        >
          ← 오가니제이션으로
        </Link>

        <h1 className="mt-3 text-2xl font-semibold text-neutral-900">
          오가니제이션 설정
        </h1>

        {orgQuery.isLoading && (
          <div className="mt-6 space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-24" />
          </div>
        )}

        {orgQuery.data && (
          <>
            <section className="mt-6">
              <Card>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">
                      이름
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setSaved(false);
                      }}
                      className="input-underline text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">
                      설명
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setSaved(false);
                      }}
                      rows={2}
                      className="input-underline text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">
                      초대의 말 (모임 초대 메일 상단에 표시)
                    </label>
                    <textarea
                      value={greeting}
                      onChange={(e) => {
                        setGreeting(e.target.value);
                        setSaved(false);
                      }}
                      rows={3}
                      placeholder="예: 함께 읽고 이야기하는 시간에 초대해요."
                      className="input-underline text-sm resize-none"
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
                      <span className="text-xs text-neutral-500">저장됨</span>
                    )}
                  </div>
                </div>
              </Card>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-medium text-neutral-500 mb-2">
                멤버 초대
              </h2>
              <Card>
                <InviteEmailInput orgId={orgQuery.data.id} />
              </Card>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-medium text-neutral-500 mb-2">
                현재 멤버 ({orgQuery.data.members.length})
              </h2>
              <Card>
                <ul className="divide-y divide-neutral-100">
                  {orgQuery.data.members.map((m) => (
                    <li key={m.id} className="py-3 flex items-center gap-3">
                      {m.profileImageUrl ? (
                        <img
                          src={m.profileImageUrl}
                          alt={m.nickname}
                          className="w-9 h-9 rounded-full object-cover border border-neutral-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-sm">
                          {m.nickname[0]}
                        </div>
                      )}
                      <span className="flex-1 text-sm">{m.nickname}</span>
                      <span className="text-xs text-neutral-500">
                        {m.role === 'OWNER' ? '소유자' : '멤버'}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
