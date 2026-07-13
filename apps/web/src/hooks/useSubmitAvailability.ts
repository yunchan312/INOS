import { useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingApi } from '@/api/endpoints/meeting';
import type { SubmitAvailabilityDto } from '@inos/types';

export function useSubmitAvailability(
  orgId: string | undefined,
  meetingId: string | undefined,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: SubmitAvailabilityDto) =>
      meetingApi.submitAvailability(
        orgId as string,
        meetingId as string,
        dto,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org', orgId, 'meetings'] });
      qc.invalidateQueries({ queryKey: ['org', orgId, 'meeting', meetingId] });
    },
  });
}
