import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { archiveApi } from '@/api/endpoints/archive';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function ArchiveDetailPage() {
  const { archiveId } = useParams<{ archiveId: string }>();
  const navigate = useNavigate();

  const { data: archive, isLoading } = useQuery({
    queryKey: ['archives', archiveId],
    queryFn: () => archiveApi.getArchive(archiveId!).then((r) => r.data),
    enabled: !!archiveId,
  });

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!archive) return null;

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm btn-circle">
            ←
          </button>
          <div>
            <h2 className="text-xl font-bold">아카이브</h2>
            <p className="text-xs text-base-content/60">
              {new Date(archive.archivedAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {archive.photoUrls && archive.photoUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {archive.photoUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`사진 ${i + 1}`}
                className="rounded-lg w-full object-cover aspect-square"
              />
            ))}
          </div>
        )}

        {archive.body && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <p className="whitespace-pre-wrap text-sm">{archive.body}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
