import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateGroupDto } from '@inos/types';
import { groupApi } from '@/api/endpoints/group';

export function useMyGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => groupApi.getMyGroups().then((r) => r.data),
  });
}

export function useGroup(groupId: string) {
  return useQuery({
    queryKey: ['groups', groupId],
    queryFn: () => groupApi.getGroup(groupId).then((r) => r.data),
    enabled: !!groupId,
  });
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: ['groups', groupId, 'members'],
    queryFn: () => groupApi.getMembers(groupId).then((r) => r.data),
    enabled: !!groupId,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGroupDto) =>
      groupApi.createGroup(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  });
}

export function useJoinGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteCode: string) =>
      groupApi.joinGroup(inviteCode).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups'] }),
  });
}
