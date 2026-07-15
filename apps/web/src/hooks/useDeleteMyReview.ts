import { useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryApi } from '@/api/endpoints/library';
import type { PromptKind } from '@inos/types';

export function useDeleteMyReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId, kind }: { meetingId: string; kind: PromptKind }) =>
      libraryApi.deleteMyReview(meetingId, kind),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['library', 'mine'] });
    },
  });
}
