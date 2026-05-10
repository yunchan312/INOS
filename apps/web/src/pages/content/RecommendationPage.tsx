import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useRecommendations } from '@/hooks/useRecommendation';
import { contentApi } from '@/api/endpoints/content';
import { Layout } from '@/components/layout/Layout';
import { ContentCard } from '@/components/content/ContentCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function RecommendationPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { data: recommendations, isLoading } = useRecommendations(groupId!);
  const qc = useQueryClient();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const { mutate: addContent, isPending } = useMutation({
    mutationFn: (contentId: string) =>
      contentApi.addGroupContent(groupId!, { contentId }),
    onSuccess: (_, contentId) => {
      setAddedIds((prev) => new Set(prev).add(contentId));
      void qc.invalidateQueries({ queryKey: ['groups', groupId, 'contents'] });
    },
  });

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto p-4 space-y-4">
        <div>
          <h2 className="text-xl font-bold">AI 추천</h2>
          <p className="text-sm text-base-content/60 mt-1">
            모임 취향에 맞는 콘텐츠를 추천해드려요
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : recommendations?.length === 0 ? (
          <p className="text-center text-base-content/40 py-12 text-sm">
            추천 콘텐츠가 없어요
          </p>
        ) : (
          <div className="space-y-3">
            {recommendations?.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                action={
                  <button
                    className="btn btn-xs btn-primary"
                    disabled={addedIds.has(content.id) || isPending}
                    onClick={() => addContent(content.id)}
                  >
                    {addedIds.has(content.id) ? '추가됨' : '모임에 추가'}
                  </button>
                }
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
