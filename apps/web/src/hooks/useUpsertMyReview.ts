import { useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryApi } from '@/api/endpoints/library';
import type { PromptKind, UpsertLibraryReviewDto } from '@inos/types';

export function useUpsertMyReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      meetingId,
      kind,
      dto,
    }: {
      meetingId: string;
      kind: PromptKind;
      dto: UpsertLibraryReviewDto;
    }) => libraryApi.upsertMyReview(meetingId, kind, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['library', 'mine'] });
    },
  });
}
