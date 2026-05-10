import { useQuery } from '@tanstack/react-query';
import { contentApi } from '@/api/endpoints/content';

export function useRecommendations(groupId: string) {
  return useQuery({
    queryKey: ['recommendations', groupId],
    queryFn: () => contentApi.getRecommendations(groupId).then((r) => r.data),
    enabled: !!groupId,
    staleTime: 1000 * 60 * 5,
  });
}
