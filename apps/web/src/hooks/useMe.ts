import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/api/endpoints/auth';
import { useAuthStore } from '@/stores/auth-store';

export function useMe(enabled = true) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['me'],
    queryFn: authApi.getMe,
    enabled: enabled && !!token,
    staleTime: 5 * 60 * 1000,
  });
}
