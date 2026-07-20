import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { libraryApi } from '@/api/endpoints/library';
import { useAuthStore } from '@/stores/auth-store';

export function useGroupLibraryShare(orgId: string | undefined, enabled: boolean) {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  const key = ['org', orgId, 'library-share'];

  const status = useQuery({
    queryKey: key,
    queryFn: () => libraryApi.getGroupShareStatus(orgId as string),
    enabled: !!token && !!orgId && enabled,
  });

  const enable = useMutation({
    mutationFn: () => libraryApi.enableGroupShare(orgId as string),
    onSuccess: (data) => qc.setQueryData(key, data),
  });

  const disable = useMutation({
    mutationFn: () => libraryApi.disableGroupShare(orgId as string),
    onSuccess: (data) => qc.setQueryData(key, data),
  });

  return { status, enable, disable };
}
