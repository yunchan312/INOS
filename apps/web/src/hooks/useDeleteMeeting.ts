import { useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingApi } from '@/api/endpoints/meeting';

export function useDeleteMeeting(orgId: string | undefined, meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => meetingApi.remove(orgId!, meetingId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['org', orgId, 'meetings'] });
    },
  });
}
