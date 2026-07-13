import { useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingApi } from '@/api/endpoints/meeting';
import type { CreateMeetingDto } from '@inos/types';

export function useCreateMeeting(orgId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMeetingDto) =>
      meetingApi.create(orgId as string, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org', orgId, 'meetings'] });
    },
  });
}
