import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useContent } from '@/hooks/useContent';
import { useMyGroups } from '@/hooks/useGroup';
import { useAddGroupContent } from '@/hooks/useContent';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

function AddToGroupSheet({
  contentId,
  onClose,
}: {
  contentId: string;
  onClose: () => void;
}) {
  const { data: groups, isLoading } = useMyGroups();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const { mutate: addContent, isPending } = useAddGroupContent(selectedGroupId ?? '');
  const navigate = useNavigate();

  const handleAdd = () => {
    if (!selectedGroupId) return;
    addContent(
      { contentId },
      {
        onSuccess: () => {
          navigate(`/group/${selectedGroupId}`);
        },
      },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full bg-[oklch(100%_0_0)] rounded-t-3xl p-6 space-y-5 max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3
            className="font-bold"
            style={{ fontFamily: "'Noto Serif KR', Georgia, serif", fontSize: '20px', color: 'oklch(18% 0.003 80)' }}
          >
            모임 선택
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ color: 'oklch(60% 0.003 80)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><LoadingSpinner /></div>
        ) : groups?.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: 'oklch(60% 0.003 80)' }}>
            참여 중인 모임이 없어요
          </p>
        ) : (
          <div className="space-y-2">
            {groups?.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className="w-full text-left p-4 rounded-2xl border transition-colors duration-150"
                style={{
                  borderColor: selectedGroupId === group.id ? '#ffdf05' : 'oklch(92% 0.005 80)',
                  backgroundColor: selectedGroupId === group.id ? 'oklch(97% 0.07 100)' : 'transparent',
                }}
              >
                <p className="font-semibold text-sm" style={{ color: 'oklch(18% 0.003 80)' }}>{group.name}</p>
                {group.description && (
                  <p className="text-xs mt-0.5" style={{ color: 'oklch(60% 0.003 80)' }}>{group.description}</p>
                )}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={!selectedGroupId || isPending}
          className="w-full min-h-[48px] rounded-[10px] text-sm font-medium transition-colors duration-150"
          style={{
            backgroundColor: selectedGroupId ? '#ffdf05' : 'oklch(85% 0.003 80)',
            color: selectedGroupId ? 'oklch(18% 0.003 80)' : 'oklch(60% 0.003 80)',
          }}
        >
          {isPending ? '추가 중...' : '모임에 추가'}
        </button>
      </div>
    </div>
  );
}

export default function ContentDetailPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [showSheet, setShowSheet] = useState(false);

  const { data: content, isLoading } = useContent(contentId!);

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!content) return null;

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 pt-6 pb-8 space-y-6">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-150"
          style={{ color: 'oklch(47% 0.004 80)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'oklch(95.5% 0.003 80)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Cover + info */}
        <div className="flex gap-5">
          {content.thumbnailUrl ? (
            <img
              src={content.thumbnailUrl}
              alt={content.title}
              className="w-28 rounded-xl border border-[oklch(92%_0.005_80)] object-cover flex-shrink-0"
              style={{ height: '168px' }}
            />
          ) : (
            <div
              className="w-28 flex-shrink-0 rounded-xl flex items-center justify-center text-sm font-medium"
              style={{ height: '168px', backgroundColor: 'oklch(95.5% 0.003 80)', color: 'oklch(60% 0.003 80)' }}
            >
              {content.type === 'MOVIE' ? '영화' : '책'}
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-2 pt-1">
            <span
              className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={
                content.type === 'MOVIE'
                  ? { backgroundColor: 'oklch(93% 0.04 68)', color: 'oklch(47% 0.10 68)' }
                  : { backgroundColor: 'oklch(90% 0.03 268)', color: 'oklch(35% 0.12 268)' }
              }
            >
              {content.type === 'MOVIE' ? '영화' : '책'}
            </span>
            <h2
              style={{
                fontFamily: "'Noto Serif KR', Georgia, serif",
                fontSize: '22px',
                fontWeight: 700,
                color: 'oklch(18% 0.003 80)',
                letterSpacing: '-0.01em',
                lineHeight: 1.25,
              }}
            >
              {content.title}
            </h2>
            <p className="text-sm" style={{ color: 'oklch(47% 0.004 80)' }}>
              {content.creator}{content.releaseYear ? ` · ${content.releaseYear}` : ''}
            </p>
          </div>
        </div>

        {/* Description */}
        {content.synopsis && (
          <div
            className="bg-[oklch(98.2%_0.002_80)] rounded-2xl p-5"
          >
            <p className="text-sm leading-relaxed" style={{ color: 'oklch(30% 0.003 80)' }}>
              {content.synopsis}
            </p>
          </div>
        )}

        {/* CTA buttons */}
        <div className="space-y-3 pt-2">
          {user ? (
            <button
              onClick={() => setShowSheet(true)}
              className="w-full min-h-[52px] rounded-[12px] text-sm font-semibold transition-colors duration-150"
              style={{ backgroundColor: '#ffdf05', color: 'oklch(18% 0.003 80)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'oklch(84% 0.21 100)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffdf05'; }}
            >
              모임에 추가하기
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full min-h-[52px] rounded-[12px] text-sm font-semibold transition-colors duration-150"
              style={{ backgroundColor: '#ffdf05', color: 'oklch(18% 0.003 80)' }}
            >
              로그인하고 모임에 추가하기
            </button>
          )}
        </div>
      </div>

      {showSheet && contentId && (
        <AddToGroupSheet contentId={contentId} onClose={() => setShowSheet(false)} />
      )}
    </Layout>
  );
}
