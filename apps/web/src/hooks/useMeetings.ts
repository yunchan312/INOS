import { useQuery } from '@tanstack/react-query';
import { meetingApi } from '@/api/endpoints/meeting';
import { useAuthStore } from '@/stores/auth-store';

export function useMeetings(orgId: string | undefined) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['org', orgId, 'meetings'],
    queryFn: () => meetingApi.list(orgId as string),
    enabled: !!token && !!orgId,
  });
}
