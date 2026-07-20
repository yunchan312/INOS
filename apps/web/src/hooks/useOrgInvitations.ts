import { useQuery } from '@tanstack/react-query';
import { groupApi } from '@/api/endpoints/group';
import { useAuthStore } from '@/stores/auth-store';

export function useOrgInvitations(orgId: string | undefined) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['org', orgId, 'invitations'],
    queryFn: () => groupApi.listInvitations(orgId as string),
    enabled: !!token && !!orgId,
  });
}
