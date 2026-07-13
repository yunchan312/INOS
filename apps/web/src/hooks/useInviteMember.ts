import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApi } from '@/api/endpoints/group';

export function useInviteMember(orgId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email: string) =>
      groupApi.inviteMember(orgId as string, { email }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org', orgId] });
      qc.invalidateQueries({ queryKey: ['org', orgId, 'members'] });
    },
  });
}
