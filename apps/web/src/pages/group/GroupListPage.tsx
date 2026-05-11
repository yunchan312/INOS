import { Link } from 'react-router-dom';
import { useMyGroups } from '@/hooks/useGroup';
import { Layout } from '@/components/layout/Layout';
import { GroupCard } from '@/components/group/GroupCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function GroupListPage() {
  const { data: groups, isLoading } = useMyGroups();

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto">

        <div className="px-4 pt-8 pb-6 flex items-center justify-between gap-3">
          <h2
            style={{
              fontFamily: "'Noto Serif KR', Georgia, serif",
              fontSize: '26px',
              fontWeight: 700,
              letterSpacing: '-0.015em',
              color: 'oklch(18% 0.003 80)',
            }}
          >
            내 모임
          </h2>
          <div className="flex gap-2">
            <Link
              to="/group/join"
              className="min-h-[44px] px-4 rounded-[10px] border text-sm font-medium flex items-center transition-colors duration-150"
              style={{ borderColor: 'oklch(88% 0.005 80)', color: 'oklch(47% 0.004 80)', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'oklch(95.5% 0.003 80)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              참여
            </Link>
            <Link
              to="/group/new"
              className="min-h-[44px] px-4 rounded-[10px] text-sm font-medium flex items-center transition-colors duration-150"
              style={{ backgroundColor: '#ffdf05', color: 'oklch(18% 0.003 80)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'oklch(84% 0.21 100)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffdf05'; }}
            >
              + 새 모임
            </Link>
          </div>
        </div>

        <div className="px-4">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : groups?.length === 0 ? (
            <div
              className="text-center py-20 rounded-2xl border"
              style={{ borderColor: 'oklch(92% 0.005 80)', borderStyle: 'dashed' }}
            >
              <p className="text-sm" style={{ color: 'oklch(60% 0.003 80)' }}>
                참여 중인 모임이 없어요
              </p>
              <Link
                to="/group/new"
                className="inline-flex items-center min-h-[44px] px-5 mt-4 rounded-[10px] text-sm font-medium transition-colors duration-150"
                style={{ backgroundColor: '#ffdf05', color: 'oklch(18% 0.003 80)' }}
              >
                첫 모임 만들기
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {groups?.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
