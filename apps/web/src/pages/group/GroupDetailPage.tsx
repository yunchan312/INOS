import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useGroup, useGroupMembers } from '@/hooks/useGroup';
import { useGroupContents } from '@/hooks/useContent';
import { Layout } from '@/components/layout/Layout';
import { MemberList } from '@/components/group/MemberList';
import { LikeButton } from '@/components/content/LikeButton';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

type Tab = 'contents' | 'meetings' | 'archive';

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = (searchParams.get('tab') as Tab) ?? 'contents';

  const { data: group, isLoading } = useGroup(groupId!);
  const { data: members } = useGroupMembers(groupId!);
  const { data: groupContents, isLoading: contentsLoading } = useGroupContents(groupId!);

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!group) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'contents', label: '콘텐츠' },
    { key: 'meetings', label: '일정' },
    { key: 'archive', label: '아카이브' },
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
              style={{ backgroundColor: 'oklch(95.5% 0.003 80)', color: 'oklch(60% 0.003 80)' }}
            >
              {group.mode === 'GROUP' ? '그룹' : '개인'}
            </span>
          </div>

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

          <p className="text-xs font-mono" style={{ color: 'oklch(60% 0.003 80)' }}>
            초대코드 <span style={{ color: 'oklch(42% 0.15 90)' }}>{group.inviteCode}</span>
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
                  ? { backgroundColor: '#ffdf05', color: 'oklch(18% 0.003 80)' }
                  : { backgroundColor: 'transparent', color: 'oklch(47% 0.004 80)' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-4 py-6 space-y-4 pb-20">
          {activeTab === 'contents' && (
            <div className="space-y-4">
              {/* Add content actions */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to={`/group/${groupId}/contents/search`}
                  className="bg-[oklch(100%_0_0)] border border-[oklch(92%_0.005_80)] rounded-2xl p-5 card-hover"
                >
                  <p className="font-semibold text-sm" style={{ color: 'oklch(18% 0.003 80)' }}>콘텐츠 검색</p>
                  <p className="text-xs mt-1" style={{ color: 'oklch(47% 0.004 80)' }}>영화/책 추가</p>
                </Link>
                <Link
                  to={`/group/${groupId}/recommendations`}
                  className="rounded-2xl p-5 transition-colors duration-150"
                  style={{ backgroundColor: '#ffdf05', color: 'oklch(18% 0.003 80)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'oklch(84% 0.21 100)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffdf05'; }}
                >
                  <p className="font-semibold text-sm">맞춤 추천</p>
                  <p className="text-xs mt-1" style={{ opacity: 0.65 }}>취향 기반 추천</p>
                </Link>
              </div>

              {/* Group content list */}
              {contentsLoading ? (
                <div className="flex justify-center py-8"><LoadingSpinner /></div>
              ) : groupContents?.length === 0 ? (
                <div
                  className="text-center py-10 rounded-2xl border"
                  style={{ borderColor: 'oklch(92% 0.005 80)', borderStyle: 'dashed' }}
                >
                  <p className="text-sm" style={{ color: 'oklch(60% 0.003 80)' }}>
                    아직 추가된 콘텐츠가 없어요
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {groupContents?.map((gc) => (
                    <div
                      key={gc.id}
                      className="bg-[oklch(100%_0_0)] border border-[oklch(92%_0.005_80)] rounded-2xl p-4 cursor-pointer card-hover"
                      onClick={() => gc.content && navigate(`/contents/${gc.content.id}`)}
                    >
                      <div className="flex gap-3">
                        {gc.content?.thumbnailUrl ? (
                          <img
                            src={gc.content.thumbnailUrl}
                            alt={gc.content.title}
                            className="w-14 rounded-lg object-cover flex-shrink-0 border border-[oklch(92%_0.005_80)]"
                            style={{ height: '80px' }}
                          />
                        ) : (
                          <div
                            className="w-14 flex-shrink-0 rounded-lg flex items-center justify-center text-xs"
                            style={{ height: '80px', backgroundColor: 'oklch(95.5% 0.003 80)', color: 'oklch(60% 0.003 80)' }}
                          >
                            {gc.content?.type === 'MOVIE' ? '영화' : '책'}
                          </div>
                        )}

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <p className="font-semibold text-[15px] leading-snug line-clamp-2" style={{ color: 'oklch(18% 0.003 80)' }}>
                              {gc.content?.title}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: 'oklch(60% 0.003 80)' }}>
                              {gc.content?.creator}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span
                              className="text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: gc.status === 'COMPLETED' ? 'oklch(90% 0.08 150)' : 'oklch(95.5% 0.003 80)',
                                color: gc.status === 'COMPLETED' ? 'oklch(35% 0.12 150)' : 'oklch(60% 0.003 80)',
                              }}
                            >
                              {gc.status === 'PENDING' ? '검토 중' : gc.status === 'CONFIRMED' ? '확정' : '완료'}
                            </span>
                            <LikeButton
                              groupId={groupId!}
                              groupContentId={gc.id}
                              likeCount={gc.likeCount}
                            />
                          </div>
                        </div>
                      </div>
                      {gc.canGenerateDiscussion && (
                        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'oklch(92% 0.005 80)' }}>
                          <p className="text-xs font-medium" style={{ color: 'oklch(42% 0.15 90)' }}>
                            발제문 생성 가능 (50% 이상 좋아요)
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Members */}
              {members && (
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
          )}

          {activeTab === 'meetings' && (
            <div className="space-y-3">
              <Link
                to={`/group/${groupId}/meetings/new`}
                className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-[10px] text-sm font-medium transition-colors duration-150"
                style={{ backgroundColor: '#ffdf05', color: 'oklch(18% 0.003 80)' }}
              >
                + 새 일정 만들기
              </Link>
            </div>
          )}

          {activeTab === 'archive' && (
            <Link
              to={`/group/${groupId}/archives`}
              className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-[10px] text-sm font-medium transition-colors duration-150 border"
              style={{ borderColor: 'oklch(92% 0.005 80)', color: 'oklch(47% 0.004 80)' }}
            >
              아카이브 보기
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
}
