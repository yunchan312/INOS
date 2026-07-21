import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { discussionApi } from '@/api/endpoints/discussion';
import { useAuthStore } from '@/stores/auth-store';

export function useImpressions(meetingId: string | undefined, enabled = true) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['impressions', meetingId],
    queryFn: () => discussionApi.listImpressions(meetingId as string),
    enabled: !!token && !!meetingId && enabled,
    retry: false,
  });
}

export function useUpsertImpression(meetingId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      discussionApi.upsertImpression(meetingId as string, content),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['impressions', meetingId] });
    },
  });
}
