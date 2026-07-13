import { useMutation, useQueryClient } from '@tanstack/react-query';
import { discussionApi } from '@/api/endpoints/discussion';
import type { UpsertDiscussionNoteDto } from '@inos/types';

export function useUpsertNote(meetingId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpsertDiscussionNoteDto) =>
      discussionApi.upsertNote(meetingId!, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['discussion-notes', meetingId] });
    },
  });
}
