import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { notificationApi } from '@/api/endpoints/notification';
import { useAuthStore } from '@/stores/auth-store';

export function useNotifications(page: number) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationApi.list(page),
    enabled: !!token,
    placeholderData: keepPreviousData,
  });
}

// 헤더 배지용 — 첫 페이지만 주기적으로 갱신해 안 읽은 수를 표시
export function useUnreadNotificationCount() {
  const token = useAuthStore((s) => s.token);
  const query = useQuery({
    queryKey: ['notifications', 1],
    queryFn: () => notificationApi.list(1),
    enabled: !!token,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
  return query.data?.unreadCount ?? 0;
}

function useInvalidateNotifications() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ['notifications'] });
  };
}

export function useMarkNotificationRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.markRead(notificationId),
    onSuccess: invalidate,
  });
}

export function useMarkAllNotificationsRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: invalidate,
  });
}
