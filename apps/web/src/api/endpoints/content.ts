import type {
  ContentDto,
  CreateGroupContentDto,
  VoteContentDto,
} from '@inos/types';
import { apiClient } from '@/api/client';
import { aiClient } from '@/api/ai-client';

interface GroupContentDto {
  id: string;
  groupId: string;
  contentId: string;
  status: string;
  averageScore?: number | null;
  content?: ContentDto;
}

export const contentApi = {
  searchContents: (query: string, type?: 'MOVIE' | 'BOOK') =>
    apiClient.get<ContentDto[]>('/contents/search', {
      params: { q: query, type },
    }),

  getGroupContents: (groupId: string) =>
    apiClient.get<GroupContentDto[]>(`/groups/${groupId}/contents`),

  addGroupContent: (groupId: string, data: CreateGroupContentDto) =>
    apiClient.post<GroupContentDto>(`/groups/${groupId}/contents`, data),

  voteContent: (
    groupId: string,
    groupContentId: string,
    data: VoteContentDto,
  ) =>
    apiClient.post(
      `/groups/${groupId}/contents/${groupContentId}/vote`,
      data,
    ),

  getRecommendations: (groupId: string) =>
    aiClient.get<ContentDto[]>(`/recommendations/${groupId}`),
};
