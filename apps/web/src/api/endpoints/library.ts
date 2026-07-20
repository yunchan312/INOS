import { apiClient } from '@/api/client';
import type {
  CreateManualLibraryEntryDto,
  LibraryDto,
  LibraryItemDto,
  LibraryShareDto,
  PromptKind,
  SharedLibraryDto,
  UpdateManualLibraryEntryDto,
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

  getGroupShareStatus: (groupId: string) =>
    apiClient
      .get<LibraryShareDto>(`/groups/${groupId}/library/share`)
      .then((r) => r.data),

  enableGroupShare: (groupId: string) =>
    apiClient
      .put<LibraryShareDto>(`/groups/${groupId}/library/share`)
      .then((r) => r.data),

  disableGroupShare: (groupId: string) =>
    apiClient
      .delete<LibraryShareDto>(`/groups/${groupId}/library/share`)
      .then((r) => r.data),

  getShared: (shareId: string) =>
    apiClient
      .get<SharedLibraryDto>(`/library/shared/${shareId}`)
      .then((r) => r.data),

  createManualEntry: (dto: CreateManualLibraryEntryDto) =>
    apiClient
      .post<LibraryItemDto>('/users/me/library/manual', dto)
      .then((r) => r.data),

  updateManualEntry: (entryId: string, dto: UpdateManualLibraryEntryDto) =>
    apiClient
      .patch<LibraryItemDto>(`/users/me/library/manual/${entryId}`, dto)
      .then((r) => r.data),

  deleteManualEntry: (entryId: string) =>
    apiClient.delete<void>(`/users/me/library/manual/${entryId}`),

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
