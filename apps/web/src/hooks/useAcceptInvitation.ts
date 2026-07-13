import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationApi } from '@/api/endpoints/invitation';

export function useAcceptInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => invitationApi.accept(token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orgs', 'mine'] });
    },
  });
}
