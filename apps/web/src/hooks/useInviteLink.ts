import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groupApi } from '@/api/endpoints/group';
import { useAuthStore } from '@/stores/auth-store';

export function useInviteLink(orgId: string | undefined) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['org', orgId, 'invite-link'],
    queryFn: () => groupApi.getInviteLink(orgId as string),
    enabled: !!token && !!orgId,
  });
}

export function useCreateInviteLink(orgId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => groupApi.createInviteLink(orgId as string),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['org', orgId, 'invite-link'] });
    },
  });
}

export function useRevokeInviteLink(orgId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => groupApi.revokeInviteLink(orgId as string),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['org', orgId, 'invite-link'] });
    },
  });
}
