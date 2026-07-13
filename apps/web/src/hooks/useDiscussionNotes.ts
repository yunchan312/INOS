import { useQuery } from '@tanstack/react-query';
import { discussionApi } from '@/api/endpoints/discussion';

export function useDiscussionNotes(meetingId: string | undefined) {
  return useQuery({
    queryKey: ['discussion-notes', meetingId],
    queryFn: () => discussionApi.listNotes(meetingId!),
    enabled: !!meetingId,
    refetchInterval: false,
  });
}
