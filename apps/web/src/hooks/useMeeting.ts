import { useQuery } from '@tanstack/react-query';
import { meetingApi } from '@/api/endpoints/meeting';
import { useAuthStore } from '@/stores/auth-store';

export function useMeeting(
  orgId: string | undefined,
  meetingId: string | undefined,
) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['org', orgId, 'meeting', meetingId],
    queryFn: () => meetingApi.getById(orgId as string, meetingId as string),
    enabled: !!token && !!orgId && !!meetingId,
  });
}
