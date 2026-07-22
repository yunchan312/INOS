import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { discussionApi } from '@/api/endpoints/discussion';
import { useAuthStore } from '@/stores/auth-store';
import type { CreateCustomPromptDto } from '@inos/types';

export function useCustomPrompts(meetingId: string | undefined, enabled = true) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['custom-prompts', meetingId],
    queryFn: () => discussionApi.listCustomPrompts(meetingId as string),
    enabled: !!token && !!meetingId && enabled,
    retry: false,
  });
}

export function useAddCustomPrompt(meetingId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCustomPromptDto) =>
      discussionApi.addCustomPrompt(meetingId as string, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['custom-prompts', meetingId] });
    },
  });
}

export function useUpdateCustomPrompt(meetingId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ promptId, content }: { promptId: string; content: string }) =>
      discussionApi.updateCustomPrompt(meetingId as string, promptId, content),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['custom-prompts', meetingId] });
    },
  });
}

export function useDeleteCustomPrompt(meetingId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (promptId: string) =>
      discussionApi.deleteCustomPrompt(meetingId as string, promptId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['custom-prompts', meetingId] });
      // 발제와 함께 삭제된 노트도 목록에서 제거
      void qc.invalidateQueries({ queryKey: ['discussion-notes', meetingId] });
    },
  });
}
