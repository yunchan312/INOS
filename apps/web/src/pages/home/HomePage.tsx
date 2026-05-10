import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useMyGroups } from '@/hooks/useGroup';
import { Layout } from '@/components/layout/Layout';
import { GroupCard } from '@/components/group/GroupCard';

function SkeletonCard() {
  return (
    <div className="bg-[oklch(100%_0_0)] border border-[oklch(92%_0.005_80)] rounded-2xl p-5 space-y-2">
      <div className="skeleton-shimmer h-4 w-2/3 rounded" />
      <div className="skeleton-shimmer h-3 w-1/2 rounded" />
    </div>
  );
}

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const { data: groups, isLoading } = useMyGroups();

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후예요';
    return '좋은 저녁이에요';
  })();

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 py-8 space-y-10">

        {/* Greeting */}
        <div className="space-y-1">
          <p
            className="font-semibold uppercase"
            style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'oklch(60% 0.003 80)' }}
          >
            {greeting}
          </p>
          <h2
            style={{
              fontFamily: "'Noto Serif KR', Georgia, serif",
              fontSize: 'clamp(36px, 9vw, 48px)',
              fontWeight: 700,
              color: 'oklch(18% 0.003 80)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {user?.nickname ?? ''}님
          </h2>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/groups/new"
            className="rounded-2xl p-6 flex flex-col gap-3 transition-colors duration-150"
            style={{ backgroundColor: 'oklch(30% 0.13 268)', color: 'oklch(98.2% 0.002 80)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'oklch(37% 0.12 268)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'oklch(30% 0.13 268)'; }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
              <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
            </svg>
            <div>
              <p className="text-sm font-semibold">모임 만들기</p>
              <p className="text-xs" style={{ opacity: 0.65 }}>새 모임 시작</p>
            </div>
          </Link>

          <Link
            to="/groups/join"
            className="bg-[oklch(100%_0_0)] border border-[oklch(92%_0.005_80)] rounded-2xl p-6 flex flex-col gap-3 card-hover"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="oklch(30% 0.13 268)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/>
            </svg>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'oklch(18% 0.003 80)' }}>모임 참여</p>
              <p className="text-xs" style={{ color: 'oklch(47% 0.004 80)' }}>초대코드 입력</p>
            </div>
          </Link>
        </div>

        {/* My groups */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3
              className="font-semibold uppercase"
              style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'oklch(60% 0.003 80)' }}
            >
              내 모임
            </h3>
            <Link
              to="/groups"
              className="text-sm font-medium"
              style={{ color: 'oklch(30% 0.13 268)' }}
            >
              전체 보기
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : groups?.length === 0 ? (
            <div
              className="text-center py-14 rounded-2xl border"
              style={{ borderColor: 'oklch(92% 0.005 80)', borderStyle: 'dashed' }}
            >
              <p className="text-sm" style={{ color: 'oklch(60% 0.003 80)' }}>
                아직 참여 중인 모임이 없어요
              </p>
              <Link
                to="/groups/new"
                className="inline-block mt-3 text-sm font-medium"
                style={{ color: 'oklch(30% 0.13 268)' }}
              >
                첫 모임 만들기 →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {groups?.slice(0, 4).map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
