import { useQuery } from '@tanstack/react-query';
import { invitationApi } from '@/api/endpoints/invitation';

export function useInvitationPreview(token: string | undefined) {
  return useQuery({
    queryKey: ['invitation', token],
    queryFn: () => invitationApi.getPreview(token as string),
    enabled: !!token,
    retry: false,
  });
}
