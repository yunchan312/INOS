import { useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryApi } from '@/api/endpoints/library';
import type { PromptKind, UpsertLibraryReviewDto } from '@inos/types';

export function useUpsertGroupReview(orgId: string | undefined) {
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
    }) => libraryApi.upsertGroupReview(orgId as string, meetingId, kind, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['org', orgId, 'library'] });
    },
  });
}
