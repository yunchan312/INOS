import { apiClient } from '@/api/client';
import type {
  LibraryDto,
  LibraryShareDto,
  PromptKind,
  SharedLibraryDto,
  UpsertLibraryReviewDto,
} from '@inos/types';

export const libraryApi = {
  getMine: () => apiClient.get<LibraryDto>('/users/me/library').then((r) => r.data),

  getShareStatus: () =>
    apiClient.get<LibraryShareDto>('/users/me/library/share').then((r) => r.data),

  enableShare: () =>
    apiClient.put<LibraryShareDto>('/users/me/library/share').then((r) => r.data),

  disableShare: () =>
    apiClient.delete<LibraryShareDto>('/users/me/library/share').then((r) => r.data),

  getShared: (shareId: string) =>
    apiClient
      .get<SharedLibraryDto>(`/library/shared/${shareId}`)
      .then((r) => r.data),

  getForGroup: (groupId: string) =>
    apiClient.get<LibraryDto>(`/groups/${groupId}/library`).then((r) => r.data),

  upsertMyReview: (meetingId: string, kind: PromptKind, dto: UpsertLibraryReviewDto) =>
    apiClient
      .put(`/users/me/library/reviews/${meetingId}/${kind}`, dto)
      .then((r) => r.data),

  deleteMyReview: (meetingId: string, kind: PromptKind) =>
    apiClient.delete(`/users/me/library/reviews/${meetingId}/${kind}`),

  upsertGroupReview: (
    groupId: string,
    meetingId: string,
    kind: PromptKind,
    dto: UpsertLibraryReviewDto,
  ) =>
    apiClient
      .put(`/groups/${groupId}/library/reviews/${meetingId}/${kind}`, dto)
      .then((r) => r.data),

  deleteGroupReview: (groupId: string, meetingId: string, kind: PromptKind) =>
    apiClient.delete(`/groups/${groupId}/library/reviews/${meetingId}/${kind}`),
};
