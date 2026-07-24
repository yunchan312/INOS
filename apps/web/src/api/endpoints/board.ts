import { apiClient } from '@/api/client';
import type {
  CreateGroupPostDto,
  GroupPostDto,
  GroupPostLikeDto,
  GroupPostListDto,
  UpdateGroupPostDto,
} from '@inos/types';

export const boardApi = {
  list: (groupId: string, page: number) =>
    apiClient
      .get<GroupPostListDto>(`/groups/${groupId}/posts`, { params: { page } })
      .then((r) => r.data),

  getById: (groupId: string, postId: string) =>
    apiClient
      .get<GroupPostDto>(`/groups/${groupId}/posts/${postId}`)
      .then((r) => r.data),

  create: (groupId: string, dto: CreateGroupPostDto) =>
    apiClient
      .post<GroupPostDto>(`/groups/${groupId}/posts`, dto)
      .then((r) => r.data),

  update: (groupId: string, postId: string, dto: UpdateGroupPostDto) =>
    apiClient
      .patch<GroupPostDto>(`/groups/${groupId}/posts/${postId}`, dto)
      .then((r) => r.data),

  remove: (groupId: string, postId: string) =>
    apiClient.delete<void>(`/groups/${groupId}/posts/${postId}`),

  toggleLike: (groupId: string, postId: string) =>
    apiClient
      .post<GroupPostLikeDto>(`/groups/${groupId}/posts/${postId}/like`)
      .then((r) => r.data),
};
