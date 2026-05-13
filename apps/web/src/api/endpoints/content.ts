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

export interface ContentListResponseDto {
  items: ContentDto[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const contentApi = {
  listContents: (type?: 'MOVIE' | 'BOOK', cursor?: string) =>
    apiClient.get<ContentListResponseDto>('/contents', {
      params: { ...(type ? { type } : {}), ...(cursor ? { cursor } : {}) },
    }),

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
