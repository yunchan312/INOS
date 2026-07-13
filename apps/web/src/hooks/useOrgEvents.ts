import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { getAuthToken } from '@/stores/auth-store';

const AI_ORIGIN = new URL(
  import.meta.env.VITE_AI_API_URL ?? 'http://localhost:3001/ai',
  window.location.origin,
).origin;

// 오가니제이션 홈 실시간 갱신 — 모임 생성/수정/삭제/확정/종료 시 목록을 다시 불러온다
export function useOrgEvents(orgId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orgId) return;
    const token = getAuthToken();
    if (!token) return;

    const socket: Socket = io(`${AI_ORIGIN}/notes`, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('join-org', orgId);
    });

    socket.on('org-event', () => {
      void queryClient.invalidateQueries({ queryKey: ['org', orgId, 'meetings'] });
    });

    return () => {
      socket.emit('leave-org', orgId);
      socket.disconnect();
    };
  }, [orgId, queryClient]);
}
