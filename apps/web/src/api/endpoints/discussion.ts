import { aiClient, buildAiSseUrl } from '@/api/ai-client';
import type {
  CreateCustomPromptDto,
  DiscussionCustomPromptDto,
  DiscussionDto,
  DiscussionImpressionDto,
  DiscussionNoteDto,
  UpsertDiscussionNoteDto,
} from '@inos/types';

export const discussionApi = {
  getByMeetingId: (meetingId: string) =>
    aiClient.get<DiscussionDto>(`/discussions/${meetingId}`).then((r) => r.data),

  upsertNote: (meetingId: string, dto: UpsertDiscussionNoteDto) =>
    aiClient
      .post<DiscussionNoteDto>(`/discussions/${meetingId}/notes`, dto)
      .then((r) => r.data),

  listNotes: (meetingId: string) =>
    aiClient.get<DiscussionNoteDto[]>(`/discussions/${meetingId}/notes`).then((r) => r.data),

  sseUrl: (meetingId: string) => buildAiSseUrl(`/discussions/stream/${meetingId}`),

  listImpressions: (meetingId: string) =>
    aiClient
      .get<DiscussionImpressionDto[]>(`/discussions/${meetingId}/impressions`)
      .then((r) => r.data),

  upsertImpression: (meetingId: string, content: string) =>
    aiClient
      .put<DiscussionImpressionDto>(`/discussions/${meetingId}/impression`, {
        content,
      })
      .then((r) => r.data),

  deleteImpression: (meetingId: string) =>
    aiClient.delete<void>(`/discussions/${meetingId}/impression`),

  listCustomPrompts: (meetingId: string) =>
    aiClient
      .get<DiscussionCustomPromptDto[]>(`/discussions/${meetingId}/custom-prompts`)
      .then((r) => r.data),

  addCustomPrompt: (meetingId: string, dto: CreateCustomPromptDto) =>
    aiClient
      .post<DiscussionCustomPromptDto>(`/discussions/${meetingId}/custom-prompts`, dto)
      .then((r) => r.data),

};
