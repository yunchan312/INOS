import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { meetingApi } from '@/api/endpoints/meeting';
import { useAuthStore } from '@/stores/auth-store';

export function useImpressions(
  orgId: string | undefined,
  meetingId: string | undefined,
  enabled = true,
) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['impressions', meetingId],
    queryFn: () => meetingApi.listImpressions(orgId as string, meetingId as string),
    enabled: !!token && !!orgId && !!meetingId && enabled,
    retry: false,
  });
}

export function useUpsertImpression(
  orgId: string | undefined,
  meetingId: string | undefined,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      meetingApi.upsertImpression(orgId as string, meetingId as string, content),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['impressions', meetingId] });
    },
  });
}
