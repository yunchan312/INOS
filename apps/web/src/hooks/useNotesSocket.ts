import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import type {
  DiscussionCustomPromptDto,
  DiscussionImpressionDto,
  DiscussionNoteDto,
} from '@inos/types';
import { getAuthToken, useAuthStore } from '@/stores/auth-store';

const AI_ORIGIN = new URL(
  import.meta.env.VITE_AI_API_URL ?? 'http://localhost:3001/ai',
  window.location.origin,
).origin;

interface NoteHiddenPayload {
  id: string;
  userId: string;
  promptKind: string;
  questionIndex: number;
}

// 모임 노트 실시간 동기화 — 공개 노트는 추가/갱신, 비공개 전환은 목록에서 제거,
// 모임 종료 시 모임 쿼리 무효화로 즉시 read-only 전환
export function useNotesSocket(
  meetingId: string | undefined,
  orgId: string | undefined,
  enabled = true,
) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!meetingId || !enabled) return;
    const token = getAuthToken();
    if (!token) return;

    const socket: Socket = io(`${AI_ORIGIN}/notes`, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('join', meetingId);
    });

    socket.on('note-updated', (note: DiscussionNoteDto) => {
      queryClient.setQueryData<DiscussionNoteDto[]>(
        ['discussion-notes', meetingId],
        (prev) => {
          const list = prev ?? [];
          const idx = list.findIndex((n) => n.id === note.id);
          if (idx >= 0) {
            const next = [...list];
            next[idx] = note;
            return next;
          }
          return [...list, note];
        },
      );
    });

    socket.on('note-hidden', (payload: NoteHiddenPayload) => {
      queryClient.setQueryData<DiscussionNoteDto[]>(
        ['discussion-notes', meetingId],
        (prev) => {
          if (!prev) return prev;
          if (payload.userId === userId) {
            // 내 노트는 비공개여도 내 화면에는 유지
            return prev.map((n) =>
              n.id === payload.id ? { ...n, isPublic: false } : n,
            );
          }
          return prev.filter((n) => n.id !== payload.id);
        },
      );
    });

    socket.on('meeting-finished', () => {
      void queryClient.invalidateQueries({
        queryKey: ['org', orgId, 'meeting', meetingId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['org', orgId, 'meetings'],
      });
    });

    // 자체 발제 질문 실시간 추가
    socket.on('custom-prompt-added', (prompt: DiscussionCustomPromptDto) => {
      queryClient.setQueryData<DiscussionCustomPromptDto[]>(
        ['custom-prompts', meetingId],
        (prev) => {
          const list = prev ?? [];
          if (list.some((p) => p.id === prompt.id)) return list;
          return [...list, prompt];
        },
      );
    });

    // 자체 발제 질문 수정/삭제 실시간 반영
    socket.on('custom-prompt-updated', (prompt: DiscussionCustomPromptDto) => {
      queryClient.setQueryData<DiscussionCustomPromptDto[]>(
        ['custom-prompts', meetingId],
        (prev) => (prev ?? []).map((p) => (p.id === prompt.id ? prompt : p)),
      );
    });

    socket.on('custom-prompt-removed', (payload: { id: string }) => {
      queryClient.setQueryData<DiscussionCustomPromptDto[]>(
        ['custom-prompts', meetingId],
        (prev) => (prev ?? []).filter((p) => p.id !== payload.id),
      );
    });

    // 작품 감상 저장/삭제 실시간 반영 (impression=null이면 삭제)
    socket.on(
      'impression-updated',
      (payload: { userId: string; impression: DiscussionImpressionDto | null }) => {
        queryClient.setQueryData<DiscussionImpressionDto[]>(
          ['impressions', meetingId],
          (prev) => {
            const list = (prev ?? []).filter((i) => i.userId !== payload.userId);
            return payload.impression ? [payload.impression, ...list] : list;
          },
        );
      },
    );

    return () => {
      socket.emit('leave', meetingId);
      socket.disconnect();
    };
  }, [meetingId, orgId, enabled, queryClient, userId]);
}
