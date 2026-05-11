import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { archiveApi } from '@/api/endpoints/archive';
import { Layout } from '@/components/layout/Layout';

function SkeletonEntry() {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center gap-1 pt-1">
        <div className="skeleton-shimmer w-3.5 h-3.5 rounded-full" />
      </div>
      <div className="flex-1 pb-6 space-y-2">
        <div className="skeleton-shimmer h-3 w-20 rounded" />
        <div className="skeleton-shimmer h-4 w-full rounded" />
      </div>
    </div>
  );
}

export default function ArchiveListPage() {
  const { groupId } = useParams<{ groupId: string }>();

  const { data: archives, isLoading } = useQuery({
    queryKey: ['groups', groupId, 'archives'],
    queryFn: () => archiveApi.getGroupArchives(groupId!).then((r) => r.data),
    enabled: !!groupId,
  });

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4">
        <h2
          className="font-bold pt-8 pb-8"
          style={{
            fontFamily: "'Noto Serif KR', Georgia, serif",
            fontSize: '26px',
            letterSpacing: '-0.015em',
            color: 'oklch(18% 0.003 80)',
          }}
        >
          아카이브
        </h2>

        {isLoading ? (
          <div className="space-y-0 timeline-line pl-6 pb-8">
            <SkeletonEntry />
            <SkeletonEntry />
            <SkeletonEntry />
          </div>
        ) : archives?.length === 0 ? (
          <div
            className="text-center py-20 mb-8 rounded-2xl border"
            style={{ borderColor: 'oklch(92% 0.005 80)', borderStyle: 'dashed' }}
          >
            <p className="text-sm" style={{ color: 'oklch(60% 0.003 80)' }}>
              아직 아카이브가 없어요
            </p>
          </div>
        ) : (
          <div className="relative timeline-line pl-6 space-y-0 pb-8">
            {archives?.map((archive) => {
              const date = new Date(archive.archivedAt);
              return (
                <div key={archive.id} className="relative flex gap-4 pb-8">
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-[oklch(98.2%_0.002_80)] z-10"
                    style={{ backgroundColor: '#ffdf05' }}
                  />

                  <Link to={`/archives/${archive.id}`} className="flex-1 min-w-0">
                    <div className="bg-[oklch(100%_0_0)] border border-[oklch(92%_0.005_80)] rounded-2xl p-4 card-hover space-y-2">
                      <p className="text-xs" style={{ color: 'oklch(47% 0.004 80)' }}>
                        {date.toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>

                      {archive.photoUrls && archive.photoUrls.length > 0 && (
                        <div className="grid grid-cols-3 gap-1.5">
                          {archive.photoUrls.slice(0, 3).map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt=""
                              className="aspect-square object-cover rounded-[6px]"
                            />
                          ))}
                        </div>
                      )}

                      {archive.body && (
                        <p className="text-sm line-clamp-2" style={{ color: 'oklch(18% 0.003 80)', lineHeight: 1.6 }}>
                          {archive.body}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
