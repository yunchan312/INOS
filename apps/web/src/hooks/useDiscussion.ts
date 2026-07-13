import { useQuery } from '@tanstack/react-query';
import { discussionApi } from '@/api/endpoints/discussion';

export function useDiscussion(meetingId: string | undefined) {
  return useQuery({
    queryKey: ['discussion', meetingId],
    queryFn: () => discussionApi.getByMeetingId(meetingId!),
    enabled: !!meetingId,
    retry: false,
  });
}
