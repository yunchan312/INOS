import { useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingApi } from '@/api/endpoints/meeting';

export function useFinishMeeting(
  orgId: string | undefined,
  meetingId: string | undefined,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => meetingApi.finish(orgId as string, meetingId as string),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org', orgId, 'meetings'] });
      qc.invalidateQueries({ queryKey: ['org', orgId, 'meeting', meetingId] });
    },
  });
}
