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
