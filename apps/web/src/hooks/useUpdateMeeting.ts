import { useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingApi } from '@/api/endpoints/meeting';
import type { UpdateMeetingDto } from '@inos/types';

export function useUpdateMeeting(orgId: string | undefined, meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateMeetingDto) => meetingApi.update(orgId!, meetingId, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['org', orgId, 'meetings'] });
      void qc.invalidateQueries({ queryKey: ['org', orgId, 'meeting', meetingId] });
    },
  });
}
