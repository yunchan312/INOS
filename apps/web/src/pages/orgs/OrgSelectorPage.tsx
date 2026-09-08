import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { GroupSummaryDto } from '@inos/types';
import { useAuth } from '@/hooks/useAuth';
import { useMe } from '@/hooks/useMe';
import { useMyOrgs } from '@/hooks/useMyOrgs';
import { useAuthStore } from '@/stores/auth-store';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { Button } from '@/components/Button';
import { apiClient } from '@/api/client';
import mascot from '@/assets/character-mascot.png';

function MascotMark() {
  return <img src={mascot} alt="" className="w-14" />;
}

function Chevron() {
  return (
    <svg
      width="7"
      height="11"
      viewBox="0 0 7 11"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-muted"
    >
      <path
        d="M1 1l4.5 4.5L1 10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 오가니제이션 한 줄. 표지가 없는 목록이라 이름 첫 글자로 액자를 대신한다. */
function OrgRow({ org }: { org: GroupSummaryDto }) {
  return (
    <li>
      <Link
        to={`/orgs/${org.id}`}
        className="flex items-center gap-4 border-b border-line px-1 py-5 transition-colors hover:bg-surface-2"
      >
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-ui border border-line bg-surface-2 text-[17px] font-bold tracking-[-0.03em]"
        >
          {org.name.trim().charAt(0)}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[19px] font-bold tracking-[-0.03em]">
            {org.name}
          </span>
          {org.description && (
            <span className="mt-1 block truncate text-[13px] font-light text-muted">
              {org.description}
            </span>
          )}
        </span>

        <span className="shrink-0 text-right">
          <span className="block text-[10px] font-semibold tracking-[0.14em] text-muted">
            {org.myRole === 'OWNER' ? '소유자' : '멤버'}
          </span>
          <span className="mt-1 block text-xs tabular-nums text-muted">
            {org.memberCount}명
          </span>
        </span>

        <Chevron />
      </Link>
    </li>
  );
}

function OrgRequestForm() {
  const [open, setOpen] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  );

  const handleSend = async () => {
    if (!orgName.trim()) return;
    setStatus('sending');
    try {
      await apiClient.post('/auth/request-org', {
        orgName: orgName.trim(),
        message: message.trim() || undefined,
      });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <p className="text-[13px] font-light text-muted">
        신청이 전송됐어요. 관리자가 확인 후 초대장을 보내드릴게요.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-b border-line pb-0.5 text-[13px] font-medium text-muted transition-colors hover:border-ink hover:text-ink"
      >
        오가니제이션 생성 신청
      </button>
    );
  }

  return (
    <div className="w-full space-y-3.5 rounded-card border border-line bg-surface p-5">
      <div>
        <p className="text-sm font-semibold">오가니제이션 생성 신청</p>
        <p className="mt-1.5 text-xs font-light leading-relaxed text-muted">
          신청 내용이 관리자에게 전달돼요. 확인 후 초대장을 보내드릴게요.
        </p>
      </div>
      <input
        type="text"
        value={orgName}
        onChange={(e) => setOrgName(e.target.value.slice(0, 80))}
        maxLength={80}
        placeholder="오가니제이션 이름 (필수)"
        className="input-underline text-sm"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="모임 목적, 인원 등을 간략히 적어주세요 (선택)"
        rows={3}
        className="input-underline resize-none text-sm"
      />
      {status === 'error' && (
        <p className="text-xs font-semibold text-danger">
          전송에 실패했어요. 다시 시도해주세요.
        </p>
      )}
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          loading={status === 'sending'}
          disabled={!orgName.trim()}
          onClick={handleSend}
        >
          신청하기
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setOpen(false);
            setStatus('idle');
          }}
        >
          취소
        </Button>
      </div>
    </div>
  );
}

export default function OrgSelectorPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const meQuery = useMe();
  const orgsQuery = useMyOrgs();

  useEffect(() => {
    if (!isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (meQuery.data) useAuthStore.getState().setUser(meQuery.data);
  }, [meQuery.data]);

  const orgs = orgsQuery.data;

  return (
    <div className="min-h-dvh bg-paper flex flex-col">
      <Header />
      <main className="page-enter mx-auto w-full max-w-3xl flex-1 px-6 pt-10 pb-20">
        <div className="border-b border-line pb-7">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-muted">
            내 오가니제이션
          </p>
          <h1 className="mt-3 text-[clamp(30px,5vw,44px)] font-bold leading-[1.1] tracking-[-0.04em]">
            {meQuery.data?.nickname
              ? `${meQuery.data.nickname}님, 이어가세요.`
              : '이어가세요.'}
          </h1>
          {orgs && orgs.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] font-light text-muted">
              <span className="tabular-nums">{orgs.length}개의 오가니제이션</span>
              <span aria-hidden="true" className="h-3 w-px bg-line" />
              <span>들어갈 곳을 고르세요</span>
            </div>
          )}
        </div>

        <section className="mt-7">
          {orgsQuery.isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-[84px] rounded-ui" />
              <Skeleton className="h-[84px] rounded-ui" />
            </div>
          )}

          {orgs && orgs.length === 0 && (
            <Card>
              <EmptyState
                media={<MascotMark />}
                title="아직 속한 오가니제이션이 없어요"
                description="초대받은 오가니제이션만 들어갈 수 있어요. 직접 만들고 싶다면 아래에서 생성을 신청해주세요."
              />
            </Card>
          )}

          {orgs && orgs.length > 0 && (
            /* 헤더의 헤어라인이 곧 목록의 윗변 — 규칙선을 두 줄 긋지 않는다 */
            <ul>
              {orgs.map((org) => (
                <OrgRow key={org.id} org={org} />
              ))}
            </ul>
          )}

          {orgs && (
            <div className="mt-10">
              <OrgRequestForm />
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
