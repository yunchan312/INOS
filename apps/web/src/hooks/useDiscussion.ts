import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discussionApi } from '@/api/endpoints/discussion';

export function useDiscussion(discussionId: string) {
  return useQuery({
    queryKey: ['discussions', discussionId],
    queryFn: () => discussionApi.getDiscussion(discussionId).then((r) => r.data),
    enabled: !!discussionId,
  });
}

export function useDiscussionNotes(discussionId: string) {
  return useQuery({
    queryKey: ['discussions', discussionId, 'notes'],
    queryFn: () => discussionApi.getNotes(discussionId).then((r) => r.data),
    enabled: !!discussionId,
  });
}

export function useUpsertNote(discussionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ questionIndex, content }: { questionIndex: number; content: string }) =>
      discussionApi.upsertNote(discussionId, questionIndex, content).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['discussions', discussionId, 'notes'] }),
  });
}

export function usePublishNote(discussionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionIndex: number) =>
      discussionApi.publishNote(discussionId, questionIndex).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['discussions', discussionId, 'notes'] }),
  });
}
