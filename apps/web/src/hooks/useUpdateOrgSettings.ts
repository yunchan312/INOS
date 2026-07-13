import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApi } from '@/api/endpoints/group';
import type { UpdateGroupSettingsDto } from '@inos/types';

export function useUpdateOrgSettings(orgId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateGroupSettingsDto) =>
      groupApi.updateSettings(orgId as string, dto),
    onSuccess: (updated) => {
      qc.setQueryData(['org', orgId], updated);
      qc.invalidateQueries({ queryKey: ['orgs', 'mine'] });
    },
  });
}
