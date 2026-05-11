import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useMyGroups } from '@/hooks/useGroup';
import { useGroupContents } from '@/hooks/useContent';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

type Tab = 'content' | 'discussion';

function MyContentTab() {
  const { data: groups, isLoading: groupsLoading } = useMyGroups();

  if (groupsLoading) return <div className="flex justify-center py-8"><LoadingSpinner /></div>;

  if (!groups?.length) {
    return (
      <div className="text-center py-16 rounded-2xl border" style={{ borderColor: 'oklch(92% 0.005 80)', borderStyle: 'dashed' }}>
        <p className="text-sm" style={{ color: 'oklch(60% 0.003 80)' }}>참여 중인 모임이 없어요</p>
        <Link to="/group/new" className="inline-block mt-3 text-sm font-medium" style={{ color: 'oklch(42% 0.15 90)' }}>
          첫 모임 만들기 →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <GroupContentSection key={group.id} groupId={group.id} groupName={group.name} />
      ))}
    </div>
  );
}

function GroupContentSection({ groupId, groupName }: { groupId: string; groupName: string }) {
  const { data: contents, isLoading } = useGroupContents(groupId);

  if (isLoading) return null;
  if (!contents?.length) return null;

  return (
    <div className="space-y-3">
      <Link to={`/group/${groupId}`} className="flex items-center gap-1">
        <h3 className="font-semibold text-sm" style={{ color: 'oklch(42% 0.15 90)' }}>{groupName}</h3>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="oklch(42% 0.15 90)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>
      <div className="space-y-2">
        {contents.map((gc) => (
          <div
            key={gc.id}
            className="bg-[oklch(100%_0_0)] border border-[oklch(92%_0.005_80)] rounded-xl p-3 flex items-center gap-3"
          >
            {gc.content?.thumbnailUrl ? (
              <img
                src={gc.content.thumbnailUrl}
                alt={gc.content.title}
                className="w-10 h-14 object-cover rounded-md border border-[oklch(92%_0.005_80)] flex-shrink-0"
              />
            ) : (
              <div
                className="w-10 h-14 flex-shrink-0 rounded-md flex items-center justify-center text-[10px]"
                style={{ backgroundColor: 'oklch(95.5% 0.003 80)', color: 'oklch(60% 0.003 80)' }}
              >
                {gc.content?.type === 'MOVIE' ? '영화' : '책'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm leading-snug line-clamp-1" style={{ color: 'oklch(18% 0.003 80)' }}>
                {gc.content?.title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'oklch(60% 0.003 80)' }}>
                좋아요 {gc.likeCount}
              </p>
            </div>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor: gc.status === 'COMPLETED' ? 'oklch(90% 0.08 150)' : 'oklch(95.5% 0.003 80)',
                color: gc.status === 'COMPLETED' ? 'oklch(35% 0.12 150)' : 'oklch(60% 0.003 80)',
              }}
            >
              {gc.status === 'PENDING' ? '검토 중' : gc.status === 'CONFIRMED' ? '확정' : '완료'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyDiscussionTab() {
  return (
    <div className="text-center py-16 rounded-2xl border" style={{ borderColor: 'oklch(92% 0.005 80)', borderStyle: 'dashed' }}>
      <p className="text-sm" style={{ color: 'oklch(60% 0.003 80)' }}>
        참여한 발제문이 없어요
      </p>
      <p className="text-xs mt-2" style={{ color: 'oklch(70% 0.003 80)' }}>
        모임 일정이 확정되면 발제문이 생성돼요
      </p>
    </div>
  );
}

export default function PersonalPage() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<Tab>('content');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'content', label: '콘텐츠' },
    { key: 'discussion', label: '발제문' },
  ];

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Profile header */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
            style={{ backgroundColor: 'oklch(97% 0.07 100)', color: 'oklch(42% 0.15 90)' }}
          >
            {user?.nickname?.[0] ?? '?'}
          </div>
          <div>
            <p className="font-bold text-lg" style={{ color: 'oklch(18% 0.003 80)' }}>
              {user?.nickname}
            </p>
            <p className="text-sm" style={{ color: 'oklch(60% 0.003 80)' }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 border-b" style={{ borderColor: 'oklch(92% 0.005 80)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2 text-sm font-medium rounded-full transition-colors duration-150"
              style={
                activeTab === tab.key
                  ? { backgroundColor: '#ffdf05', color: 'oklch(18% 0.003 80)' }
                  : { backgroundColor: 'transparent', color: 'oklch(47% 0.004 80)' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'content' ? <MyContentTab /> : <MyDiscussionTab />}
        </div>
      </div>
    </Layout>
  );
}
