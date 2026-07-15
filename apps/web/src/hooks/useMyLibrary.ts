import { useQuery } from '@tanstack/react-query';
import { libraryApi } from '@/api/endpoints/library';
import { useAuthStore } from '@/stores/auth-store';

export function useMyLibrary() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['library', 'mine'],
    queryFn: libraryApi.getMine,
    enabled: !!token,
  });
}
