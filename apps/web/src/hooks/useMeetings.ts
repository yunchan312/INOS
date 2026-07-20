import { useQuery } from '@tanstack/react-query';
import { meetingApi } from '@/api/endpoints/meeting';
import { useAuthStore } from '@/stores/auth-store';

export function useMeetings(orgId: string | undefined) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['org', orgId, 'meetings'],
    queryFn: () => meetingApi.list(orgId as string),
    enabled: !!token && !!orgId,
    // 발제문 생성 중인 확정 모임이 있으면 5초마다 갱신해 카드가 "보기" 버튼으로 전환되게 함
    refetchInterval: (query) => {
      const generating = query.state.data?.some(
        (m) =>
          m.status === 'CONFIRMED' &&
          (!m.discussionId || m.discussionStatus === 'GENERATING'),
      );
      return generating ? 5000 : false;
    },
  });
}
