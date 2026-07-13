import { useQuery } from '@tanstack/react-query';
import { groupApi } from '@/api/endpoints/group';
import { useAuthStore } from '@/stores/auth-store';

export function useOrgMembers(orgId: string | undefined) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['org', orgId, 'members'],
    queryFn: () => groupApi.listMembers(orgId as string),
    enabled: !!token && !!orgId,
  });
}
