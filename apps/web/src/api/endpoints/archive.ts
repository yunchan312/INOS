import type { ArchiveDto, CreateArchiveDto } from '@inos/types';
import { apiClient } from '@/api/client';

export const archiveApi = {
  getGroupArchives: (groupId: string) =>
    apiClient.get<ArchiveDto[]>(`/groups/${groupId}/archives`),

  getArchive: (archiveId: string) =>
    apiClient.get<ArchiveDto>(`/archives/${archiveId}`),

  createArchive: (groupId: string, meetingId: string, data: CreateArchiveDto) =>
    apiClient.post<ArchiveDto>(
      `/groups/${groupId}/meetings/${meetingId}/archives`,
      data,
    ),

  updateArchive: (archiveId: string, data: Partial<CreateArchiveDto>) =>
    apiClient.patch<ArchiveDto>(`/archives/${archiveId}`, data),
};
