import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { libraryApi } from '@/api/endpoints/library';
import { useAuthStore } from '@/stores/auth-store';

export function useLibraryShare() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();

  const status = useQuery({
    queryKey: ['library', 'share'],
    queryFn: libraryApi.getShareStatus,
    enabled: !!token,
  });

  const enable = useMutation({
    mutationFn: libraryApi.enableShare,
    onSuccess: (data) => qc.setQueryData(['library', 'share'], data),
  });

  const disable = useMutation({
    mutationFn: libraryApi.disableShare,
    onSuccess: (data) => qc.setQueryData(['library', 'share'], data),
  });

  return { status, enable, disable };
}
