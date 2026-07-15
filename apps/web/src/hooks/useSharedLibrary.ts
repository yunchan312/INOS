import { useQuery } from '@tanstack/react-query';
import { libraryApi } from '@/api/endpoints/library';

export function useSharedLibrary(shareId: string | undefined) {
  return useQuery({
    queryKey: ['library', 'shared', shareId],
    queryFn: () => libraryApi.getShared(shareId as string),
    enabled: !!shareId,
    retry: false,
  });
}
