import type {
  GroupDto,
  GroupMemberDto,
  CreateGroupDto,
} from '@inos/types';
import { apiClient } from '@/api/client';

export const groupApi = {
  getMyGroups: () =>
    apiClient.get<GroupDto[]>('/groups'),

  getGroup: (groupId: string) =>
    apiClient.get<GroupDto>(`/groups/${groupId}`),

  createGroup: (data: CreateGroupDto) =>
    apiClient.post<GroupDto>('/groups', data),

  joinGroup: (inviteCode: string) =>
    apiClient.post<GroupMemberDto>('/groups/join', { inviteCode }),

  getMembers: (groupId: string) =>
    apiClient.get<GroupMemberDto[]>(`/groups/${groupId}/members`),

  leaveGroup: (groupId: string) =>
    apiClient.delete(`/groups/${groupId}/members/me`),
};
