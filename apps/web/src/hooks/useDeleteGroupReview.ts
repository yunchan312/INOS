import { useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryApi } from '@/api/endpoints/library';
import type { PromptKind } from '@inos/types';

export function useDeleteGroupReview(orgId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId, kind }: { meetingId: string; kind: PromptKind }) =>
      libraryApi.deleteGroupReview(orgId as string, meetingId, kind),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['org', orgId, 'library'] });
    },
  });
}
