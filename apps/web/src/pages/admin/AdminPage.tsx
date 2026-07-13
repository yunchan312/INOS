import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import type { AdminCreateOrgResponseDto, AdminOrgDto } from '@inos/types';
import { keepPreviousData } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useMe } from '@/hooks/useMe';
import { adminApi } from '@/api/endpoints/admin';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';

type MenuKey = 'orgs' | 'users' | 'create-org';

function extractErrorMessage(e: unknown): string {
  if (isAxiosError(e) && e.response?.data?.message) {
    const msg = e.response.data.message;
    return Array.isArray(msg) ? msg.join(', ') : msg;
  }
  return '요청에 실패했어요. 다시 시도해주세요.';
}

const inputClass =
  'w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:outline-none';

function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-4 pt-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="text-sm text-neutral-600 hover:text-neutral-900 disabled:opacity-30"
      >
        ← 이전
      </button>
      <span className="text-xs text-neutral-500">
        {page} / {totalPages} 페이지 · 총 {total}개
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="text-sm text-neutral-600 hover:text-neutral-900 disabled:opacity-30"
      >
        다음 →
      </button>
    </div>
  );
}

// 검색어 디바운스 + 검색 변경 시 1페이지로 리셋
function useSearchPage() {
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return { search, setSearch, keyword, page, setPage };
}

function CreateOrgForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<AdminCreateOrgResponseDto | null>(
    null,
  );

  const canSubmit = name.trim().length > 0 && ownerEmail.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const org = await adminApi.createOrg({
        name: name.trim(),
        description: description.trim() || undefined,
        ownerEmail: ownerEmail.trim(),
      });
      setCreated(org);
      setName('');
      setDescription('');
      setOwnerEmail('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'orgs'] });
    } catch (e) {
      setError(extractErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {created && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm">
          <p className="font-medium text-green-800">
            「{created.name}」 생성 완료
          </p>
          <p className="mt-1 text-green-700">
            소유자: {created.ownerNickname} ({created.ownerEmail}) — 알림 메일을
            보냈어요.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            오가니제이션 이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 수요 인문학 클럽"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            설명
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="모임을 간단히 소개해주세요 (선택)"
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            소유자 이메일 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            placeholder="owner@example.com"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-neutral-500">
            한 번 이상 로그인한 적 있는 계정이어야 해요.
          </p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={submitting}
          disabled={!canSubmit}
        >
          오가니제이션 생성
        </Button>
      </div>
    </div>
  );
}

function OrgRow({ org }: { org: AdminOrgDto }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [name, setName] = useState(org.name);
  const [description, setDescription] = useState(org.description ?? '');
  const [error, setError] = useState<string | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'orgs'] });

  const updateMutation = useMutation({
    mutationFn: () =>
      adminApi.updateOrg(org.id, {
        name: name.trim(),
        description: description.trim(),
      }),
    onSuccess: () => {
      setEditing(false);
      setError(null);
      invalidate();
    },
    onError: (e) => setError(extractErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteOrg(org.id),
    onSuccess: invalidate,
    onError: (e) => {
      setConfirmingDelete(false);
      setError(extractErrorMessage(e));
    },
  });

  if (editing) {
    return (
      <Card>
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="설명 (비우면 삭제)"
            rows={2}
            className={`${inputClass} resize-none`}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              loading={updateMutation.isPending}
              disabled={name.trim().length === 0}
              onClick={() => updateMutation.mutate()}
            >
              저장
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(false);
                setName(org.name);
                setDescription(org.description ?? '');
                setError(null);
              }}
            >
              취소
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-neutral-900">{org.name}</p>
          {org.description && (
            <p className="mt-0.5 text-sm text-neutral-500 line-clamp-1">
              {org.description}
            </p>
          )}
          <p className="mt-1 text-xs text-neutral-500">
            소유자 {org.ownerNickname} ({org.ownerEmail}) · 멤버{' '}
            {org.memberCount}명 · 모임 {org.meetingCount}회
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          {confirmingDelete ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                loading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
              >
                <span className="text-red-600">정말 삭제</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingDelete(false)}
              >
                취소
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                수정
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingDelete(true)}
              >
                <span className="text-red-600">삭제</span>
              </Button>
            </>
          )}
        </div>
      </div>
      {error && !editing && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </Card>
  );
}

function OrgManageSection() {
  const { search, setSearch, keyword, page, setPage } = useSearchPage();
  const [memberInput, setMemberInput] = useState('');
  const [member, setMember] = useState('');
  const [minMembers, setMinMembers] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setMember(memberInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [memberInput, setPage]);

  const minMembersNum = Math.max(0, Number(minMembers) || 0);

  const orgsQuery = useQuery({
    queryKey: ['admin', 'orgs', keyword, member, minMembersNum, page],
    queryFn: () =>
      adminApi.listOrgs({
        search: keyword || undefined,
        member: member || undefined,
        minMembers: minMembersNum || undefined,
        page,
      }),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-3">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="이름, 소유자 이메일/닉네임으로 검색"
        className={inputClass}
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          type="search"
          value={memberInput}
          onChange={(e) => setMemberInput(e.target.value)}
          placeholder="특정 멤버 (이메일/닉네임)"
          className={inputClass}
        />
        <input
          type="number"
          min={0}
          value={minMembers}
          onChange={(e) => {
            setMinMembers(e.target.value);
            setPage(1);
          }}
          placeholder="멤버 N명 이상"
          className={inputClass}
        />
      </div>

      {orgsQuery.isLoading &&
        Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}

      {orgsQuery.isError && (
        <p className="text-sm text-red-500">목록을 불러오지 못했어요.</p>
      )}

      {orgsQuery.data && orgsQuery.data.items.length === 0 && (
        <EmptyState
          title={keyword ? '검색 결과가 없어요' : '오가니제이션이 없어요'}
          description={
            keyword
              ? '다른 키워드로 검색해보세요.'
              : '새 오가니제이션 탭에서 만들 수 있어요.'
          }
        />
      )}

      {orgsQuery.data?.items.map((org) => <OrgRow key={org.id} org={org} />)}

      {orgsQuery.data && (
        <Pagination
          page={orgsQuery.data.page}
          total={orgsQuery.data.total}
          pageSize={orgsQuery.data.pageSize}
          onChange={setPage}
        />
      )}
    </div>
  );
}

function UserManageSection({ myId }: { myId: string }) {
  const { search, setSearch, keyword, page, setPage } = useSearchPage();
  const [joinedAfter, setJoinedAfter] = useState('');
  const [adminOnly, setAdminOnly] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', keyword, joinedAfter, adminOnly, page],
    queryFn: () =>
      adminApi.listUsers({
        search: keyword || undefined,
        joinedAfter: joinedAfter || undefined,
        adminOnly: adminOnly || undefined,
        page,
      }),
    placeholderData: keepPreviousData,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

  const setAdminMutation = useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
      adminApi.setUserAdmin(userId, isAdmin),
    onSuccess: () => {
      setActionError(null);
      invalidate();
    },
    onError: (e) => setActionError(extractErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      setActionError(null);
      invalidate();
    },
    onError: (e) => setActionError(extractErrorMessage(e)),
  });

  const handleToggleAdmin = (userId: string, nickname: string, next: boolean) => {
    if (
      window.confirm(
        next
          ? `${nickname}님에게 관리자 권한을 부여할까요?`
          : `${nickname}님의 관리자 권한을 해제할까요?`,
      )
    ) {
      setAdminMutation.mutate({ userId, isAdmin: next });
    }
  };

  const handleDelete = (userId: string, nickname: string) => {
    if (
      window.confirm(
        `${nickname}님을 삭제할까요? 멤버십과 노트가 모두 삭제되며 되돌릴 수 없어요.`,
      )
    ) {
      deleteMutation.mutate(userId);
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="이메일, 닉네임으로 검색"
        className={inputClass}
      />

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-xs text-neutral-500 mb-1">
            가입일 (이후)
          </label>
          <input
            type="date"
            value={joinedAfter}
            onChange={(e) => {
              setJoinedAfter(e.target.value);
              setPage(1);
            }}
            className={inputClass}
          />
        </div>
        <label className="flex items-center gap-2 pt-5 cursor-pointer select-none shrink-0">
          <input
            type="checkbox"
            checked={adminOnly}
            onChange={(e) => {
              setAdminOnly(e.target.checked);
              setPage(1);
            }}
            className="rounded border-neutral-300"
          />
          <span className="text-sm text-neutral-700">관리자만</span>
        </label>
      </div>

      {actionError && <p className="text-sm text-red-500">{actionError}</p>}

      {usersQuery.isLoading &&
        Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}

      {usersQuery.isError && (
        <p className="text-sm text-red-500">목록을 불러오지 못했어요.</p>
      )}

      {usersQuery.data && usersQuery.data.items.length === 0 && (
        <EmptyState
          title={keyword ? '검색 결과가 없어요' : '사용자가 없어요'}
          description={keyword ? '다른 키워드로 검색해보세요.' : undefined}
        />
      )}

      {usersQuery.data && usersQuery.data.items.length > 0 && (
        <Card>
          <ul className="divide-y divide-neutral-100">
            {usersQuery.data.items.map((u) => (
              <li key={u.id} className="py-3 flex items-center gap-3">
                {u.profileImageUrl ? (
                  <img
                    src={u.profileImageUrl}
                    alt={u.nickname}
                    className="w-9 h-9 rounded-full object-cover border border-neutral-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-sm">
                    {u.nickname[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-neutral-900 truncate">
                    {u.nickname}
                    {u.isAdmin && (
                      <span className="ml-2 text-[10px] bg-neutral-900 text-white px-1.5 py-0.5 rounded-full align-middle">
                        관리자
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">{u.email}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-neutral-500">
                  <p>오가니제이션 {u.orgCount}개</p>
                  <p>{new Date(u.createdAt).toLocaleDateString('ko-KR')} 가입</p>
                </div>
                {u.id !== myId && (
                  <div className="shrink-0 flex flex-col items-end gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleAdmin(u.id, u.nickname, !u.isAdmin)}
                      disabled={setAdminMutation.isPending}
                      className="text-neutral-500 hover:text-neutral-800 underline underline-offset-2 disabled:opacity-50"
                    >
                      {u.isAdmin ? '관리자 해제' : '관리자 부여'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(u.id, u.nickname)}
                      disabled={deleteMutation.isPending}
                      className="text-red-500 hover:text-red-600 underline underline-offset-2 disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {usersQuery.data && (
        <Pagination
          page={usersQuery.data.page}
          total={usersQuery.data.total}
          pageSize={usersQuery.data.pageSize}
          onChange={setPage}
        />
      )}
    </div>
  );
}

export default function AdminPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const meQuery = useMe();
  const [activeMenu, setActiveMenu] = useState<MenuKey>('orgs');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }
    if (meQuery.data && !meQuery.data.isAdmin) {
      navigate('/orgs', { replace: true });
    }
  }, [isAuthenticated, meQuery.data, navigate]);

  if (meQuery.isLoading || !meQuery.data?.isAdmin) {
    return (
      <div className="min-h-dvh bg-neutral-50">
        <Header />
        <main className="mx-auto max-w-3xl px-4 pt-6 pb-safe">
          <Skeleton className="h-40" />
        </main>
      </div>
    );
  }

  const menus: { key: MenuKey; label: string }[] = [
    { key: 'orgs', label: '오가니제이션 관리' },
    { key: 'users', label: '사용자' },
    { key: 'create-org', label: '새 오가니제이션' },
  ];

  return (
    <div className="min-h-dvh bg-neutral-50">
      <Header />
      <main className="mx-auto max-w-3xl px-4 pt-6 pb-safe page-enter">
        <h2 className="text-xl font-semibold text-neutral-900">관리자</h2>
        <p className="text-sm text-neutral-500 mt-1">
          INOS 운영 도구 모음이에요.
        </p>

        <div className="mt-6 flex gap-2">
          {menus.map((menu) => (
            <button
              key={menu.key}
              type="button"
              onClick={() => setActiveMenu(menu.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeMenu === menu.key
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400'
              }`}
            >
              {menu.label}
            </button>
          ))}
        </div>

        <section className="mt-4">
          {activeMenu === 'orgs' && <OrgManageSection />}
          {activeMenu === 'users' && <UserManageSection myId={meQuery.data.id} />}
          {activeMenu === 'create-org' && (
            <Card>
              <h3 className="font-medium text-neutral-900 mb-4">
                새 오가니제이션 만들기
              </h3>
              <CreateOrgForm />
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
