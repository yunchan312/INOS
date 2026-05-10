import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useGroup, useGroupMembers } from '@/hooks/useGroup';
import { Layout } from '@/components/layout/Layout';
import { MemberList } from '@/components/group/MemberList';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

type Tab = 'contents' | 'meetings' | 'archive';

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as Tab) ?? 'contents';

  const { data: group, isLoading } = useGroup(groupId!);
  const { data: members } = useGroupMembers(groupId!);

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!group) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'contents',  label: '콘텐츠' },
    { key: 'meetings',  label: '일정' },
    { key: 'archive',   label: '아카이브' },
  ];

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto">
        {/* Header */}
        <div className="px-4 pt-6 pb-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2
                className="font-bold truncate"
                style={{ fontFamily: "'Noto Serif KR', Georgia, serif", fontSize: '28px', lineHeight: 1.15, letterSpacing: '-0.015em', color: 'oklch(18% 0.003 80)' }}
              >
                {group.name}
              </h2>
              {group.description && (
                <p className="text-sm mt-1" style={{ color: 'oklch(47% 0.004 80)' }}>
                  {group.description}
                </p>
              )}
            </div>
            <span
              className="flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'oklch(90% 0.03 268)', color: 'oklch(35% 0.12 268)' }}
            >
              {group.mode === 'GROUP' ? '그룹' : '개인'}
            </span>
          </div>

          {/* Members row */}
          {members && members.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-2">
                {members.slice(0, 5).map((m) => (
                  <span
                    key={m.id}
                    className="w-7 h-7 rounded-full border-2 border-[oklch(98.2%_0.002_80)] flex items-center justify-center text-[11px] font-semibold"
                    style={{ backgroundColor: 'oklch(93% 0.04 68)', color: 'oklch(47% 0.10 68)' }}
                  >
                    {m.user?.nickname?.[0] ?? '?'}
                  </span>
                ))}
              </div>
              <span className="text-xs" style={{ color: 'oklch(47% 0.004 80)' }}>
                멤버 {members.length}명
              </span>
            </div>
          )}

          {/* Invite code */}
          <p className="text-xs font-mono" style={{ color: 'oklch(60% 0.003 80)' }}>
            초대코드 <span style={{ color: 'oklch(30% 0.13 268)' }}>{group.inviteCode}</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-1 pb-4 flex gap-1.5 border-b" style={{ borderColor: 'oklch(92% 0.005 80)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSearchParams({ tab: tab.key })}
              className="px-4 py-2 text-sm font-medium rounded-full transition-colors duration-150"
              style={
                activeTab === tab.key
                  ? { backgroundColor: 'oklch(30% 0.13 268)', color: 'oklch(98.2% 0.002 80)' }
                  : { backgroundColor: 'transparent', color: 'oklch(47% 0.004 80)' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-4 py-6 space-y-4">
          {activeTab === 'contents' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to={`/groups/${groupId}/contents/search`}
                  className="bg-[oklch(100%_0_0)] border border-[oklch(92%_0.005_80)] rounded-2xl p-5 card-hover"
                >
                  <p className="font-semibold text-sm" style={{ color: 'oklch(18% 0.003 80)' }}>콘텐츠 검색</p>
                  <p className="text-xs mt-1" style={{ color: 'oklch(47% 0.004 80)' }}>영화/책 추가</p>
                </Link>
                <Link
                  to={`/groups/${groupId}/recommendations`}
                  className="rounded-2xl p-5 transition-colors duration-150"
                  style={{ backgroundColor: 'oklch(30% 0.13 268)', color: 'oklch(98.2% 0.002 80)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'oklch(37% 0.12 268)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'oklch(30% 0.13 268)'; }}
                >
                  <p className="font-semibold text-sm">맞춤 추천</p>
                  <p className="text-xs mt-1" style={{ opacity: 0.65 }}>취향 기반 추천</p>
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'meetings' && (
            <div className="space-y-3">
              <Link
                to={`/groups/${groupId}/meetings/new`}
                className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-[10px] text-sm font-medium transition-colors duration-150"
                style={{ backgroundColor: 'oklch(30% 0.13 268)', color: 'oklch(98.2% 0.002 80)' }}
              >
                + 새 일정 만들기
              </Link>
            </div>
          )}

          {activeTab === 'archive' && (
            <Link
              to={`/groups/${groupId}/archives`}
              className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-[10px] text-sm font-medium transition-colors duration-150 border"
              style={{ borderColor: 'oklch(92% 0.005 80)', color: 'oklch(30% 0.13 268)' }}
            >
              아카이브 보기
            </Link>
          )}

          {/* Members section */}
          {members && activeTab === 'contents' && (
            <div className="pt-6 border-t" style={{ borderColor: 'oklch(92% 0.005 80)' }}>
              <h3
                className="font-semibold uppercase mb-4"
                style={{ fontSize: '11px', letterSpacing: '0.1em', color: 'oklch(60% 0.003 80)' }}
              >
                멤버
              </h3>
              <MemberList members={members} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
