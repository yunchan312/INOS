import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApi } from '@/api/endpoints/group';

export function useRevokeInvitation(orgId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      groupApi.revokeInvitation(orgId!, invitationId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['org', orgId, 'invitations'] });
    },
  });
}
