import { apiClient } from '@/api/client';

export interface NoteAuthorDto {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
}

export interface DiscussionNoteDto {
  id: string;
  discussionId: string;
  userId: string;
  questionIndex: number;
  content: string;
  isPublic: boolean;
  publishedAt: string | null;
  createdAt: string;
  user: NoteAuthorDto;
}

export interface DiscussionDto {
  id: string;
  meetingId: string;
  questions: string[];
  body: string;
  createdAt: string;
}

export const discussionApi = {
  getDiscussion: (discussionId: string) =>
    apiClient.get<DiscussionDto>(`/discussions/${discussionId}`),

  getNotes: (discussionId: string) =>
    apiClient.get<DiscussionNoteDto[]>(`/discussions/${discussionId}/notes`),

  upsertNote: (discussionId: string, questionIndex: number, content: string) =>
    apiClient.post<DiscussionNoteDto>(`/discussions/${discussionId}/notes`, {
      questionIndex,
      content,
    }),

  publishNote: (discussionId: string, questionIndex: number) =>
    apiClient.patch<DiscussionNoteDto>(
      `/discussions/${discussionId}/notes/${questionIndex}/publish`,
    ),
};
