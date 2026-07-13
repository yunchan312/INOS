import { useQuery } from '@tanstack/react-query';
import { groupApi } from '@/api/endpoints/group';
import { useAuthStore } from '@/stores/auth-store';

export function useMyOrgs() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['orgs', 'mine'],
    queryFn: groupApi.getMine,
    enabled: !!token,
  });
}
