import { useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingApi } from '@/api/endpoints/meeting';

interface RetryPayload {
  bookTitle?: string;
  bookAuthor?: string;
  movieTitle?: string;
  movieDirector?: string;
}

// 발제문 생성 실패 → 작품 정보 확인 후 재생성
export function useRetryDiscussion(
  orgId: string | undefined,
  meetingId: string | undefined,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: RetryPayload) =>
      meetingApi.retryDiscussion(orgId as string, meetingId as string, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['org', orgId, 'meetings'] });
      void qc.invalidateQueries({ queryKey: ['org', orgId, 'meeting', meetingId] });
      void qc.invalidateQueries({ queryKey: ['discussion', meetingId] });
    },
  });
}
