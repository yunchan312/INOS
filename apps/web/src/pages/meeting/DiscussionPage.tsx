import { useNavigate, useParams } from 'react-router-dom';
import { useSSE } from '@/hooks/useSSE';
import { Layout } from '@/components/layout/Layout';
import { StreamingText } from '@/components/discussion/StreamingText';

const AI_BASE = import.meta.env.VITE_AI_API_URL ?? '/ai';

export default function DiscussionPage() {
  const { groupId, meetingId } = useParams<{ groupId: string; meetingId: string }>();
  const navigate = useNavigate();

  const sseUrl = meetingId ? `${AI_BASE}/discussions/stream/${meetingId}` : null;
  const { text, isDone, isError } = useSSE(sseUrl);

  const handleShare = () => {
    void navigator.share?.({ title: 'INOS 발제문', text });
  };

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 pt-8 pb-6 space-y-8">
        {/* Header */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-150"
            style={{ backgroundColor: 'transparent', color: 'oklch(47% 0.004 80)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'oklch(95.5% 0.003 80)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            aria-label="뒤로 가기"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h2
              style={{
                fontFamily: "'Noto Serif KR', Georgia, serif",
                fontSize: '24px',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: 'oklch(18% 0.003 80)',
              }}
            >
              발제문
            </h2>
            {!isDone && !isError && (
              <p className="text-xs mt-1" style={{ color: 'oklch(47% 0.004 80)' }}>생성 중...</p>
            )}
          </div>
        </div>

        {/* Error */}
        {isError && (
          <div
            className="rounded-2xl px-4 py-3 text-sm"
            style={{ backgroundColor: 'oklch(93% 0.04 18)', color: 'oklch(40% 0.18 18)' }}
          >
            발제문 생성 중 오류가 발생했습니다. 다시 시도해주세요.
          </div>
        )}

        {/* Skeleton */}
        {!text && !isError && (
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="skeleton-shimmer h-5 w-1/2 rounded" />
              <div className="skeleton-shimmer h-4 w-full rounded" />
              <div className="skeleton-shimmer h-4 w-5/6 rounded" />
              <div className="skeleton-shimmer h-4 w-4/5 rounded" />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <span
                className="text-xs font-medium"
                style={{ color: 'oklch(30% 0.13 268)' }}
              >
                발제문을 생성하고 있어요
              </span>
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full"
                    style={{
                      backgroundColor: 'oklch(30% 0.13 268)',
                      opacity: 0.4,
                      animation: `blink 1.2s ${i * 0.4}s infinite`,
                    }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}

        {/* Discussion body */}
        {text && (
          <div
            className="bg-[oklch(100%_0_0)] border border-[oklch(92%_0.005_80)] rounded-2xl p-6 sm:p-8"
            style={{ minHeight: '200px' }}
          >
            <StreamingText text={text} isDone={isDone} />
          </div>
        )}

        {/* Done actions */}
        {isDone && (
          <div className="flex gap-3">
            <button
              className="flex-1 min-h-[48px] rounded-[10px] text-sm font-medium border transition-colors duration-150"
              style={{ borderColor: 'oklch(92% 0.005 80)', color: 'oklch(47% 0.004 80)' }}
              onClick={() => navigate(`/groups/${groupId}/meetings/${meetingId}`)}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'oklch(95.5% 0.003 80)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              돌아가기
            </button>
            {typeof navigator.share === 'function' && (
              <button
                className="flex-1 min-h-[48px] rounded-[10px] text-sm font-medium transition-colors duration-150"
                style={{ backgroundColor: 'oklch(30% 0.13 268)', color: 'oklch(98.2% 0.002 80)' }}
                onClick={handleShare}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'oklch(37% 0.12 268)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'oklch(30% 0.13 268)'; }}
              >
                공유하기
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
