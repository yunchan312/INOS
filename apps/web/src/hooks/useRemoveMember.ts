import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApi } from '@/api/endpoints/group';

export function useRemoveMember(orgId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => groupApi.removeMember(orgId!, userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['org', orgId] });
    },
  });
}
