import type { ContentDto, CreateGroupContentDto } from '@inos/types';
import { apiClient } from '@/api/client';
import { aiClient } from '@/api/ai-client';

export interface GroupContentDto {
  id: string;
  groupId: string;
  contentId: string;
  status: string;
  likeCount: number;
  canGenerateDiscussion: boolean;
  content?: ContentDto;
}

export interface LikeResponseDto {
  liked: boolean;
}

export const contentApi = {
  listContents: (type?: 'MOVIE' | 'BOOK') =>
    apiClient.get<ContentDto[]>('/contents', { params: type ? { type } : {} }),

  searchContents: (query: string, type?: 'MOVIE' | 'BOOK') =>
    apiClient.get<ContentDto[]>('/contents/search', { params: { q: query, type } }),

  getContent: (contentId: string) =>
    apiClient.get<ContentDto>(`/contents/${contentId}`),

  getGroupContents: (groupId: string) =>
    apiClient.get<GroupContentDto[]>(`/groups/${groupId}/contents`),

  addGroupContent: (groupId: string, data: CreateGroupContentDto) =>
    apiClient.post<GroupContentDto>(`/groups/${groupId}/contents`, data),

  toggleLike: (groupId: string, groupContentId: string) =>
    apiClient.post<LikeResponseDto>(
      `/groups/${groupId}/contents/${groupContentId}/likes`,
    ),

  getRecommendations: (groupId: string) =>
    aiClient.get<ContentDto[]>(`/recommendations/${groupId}`),
};
