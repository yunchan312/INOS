import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ContentDto, ContentType } from '@inos/types';
import { contentApi } from '@/api/endpoints/content';
import { Layout } from '@/components/layout/Layout';
import { ContentCard } from '@/components/content/ContentCard';
import { ContentSearchBar } from '@/components/content/ContentSearchBar';

export default function ContentSearchPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const qc = useQueryClient();
  const [results, setResults] = useState<ContentDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const search = async (query: string, type?: ContentType) => {
    setIsSearching(true);
    try {
      const { data } = await contentApi.searchContents(query, type);
      setResults(data);
    } finally {
      setIsSearching(false);
    }
  };

  const { mutate: addContent, isPending: isAdding } = useMutation({
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
        <h2 className="text-xl font-bold">콘텐츠 검색</h2>
        <ContentSearchBar onSearch={(q, t) => void search(q, t)} isLoading={isSearching} />

        <div className="space-y-3">
          {results.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              action={
                <button
                  className="btn btn-xs btn-primary"
                  disabled={addedIds.has(content.id) || isAdding}
                  onClick={() => addContent(content.id)}
                >
                  {addedIds.has(content.id) ? '추가됨' : '추가'}
                </button>
              }
            />
          ))}
        </div>

        {results.length === 0 && !isSearching && (
          <p className="text-center text-base-content/40 py-8 text-sm">
            검색어를 입력해 콘텐츠를 찾아보세요
          </p>
        )}
      </div>
    </Layout>
  );
}
