import { apiClient } from '@/api/client';
import type {
  GroupDetailDto,
  GroupInvitationDto,
  GroupMemberDto,
  GroupSummaryDto,
  InviteMemberDto,
  InvitationPreviewDto,
  UpdateGroupSettingsDto,
} from '@inos/types';

export const groupApi = {
  getMine: () =>
    apiClient.get<GroupSummaryDto[]>('/groups').then((r) => r.data),

  getById: (groupId: string) =>
    apiClient.get<GroupDetailDto>(`/groups/${groupId}`).then((r) => r.data),

  listMembers: (groupId: string) =>
    apiClient
      .get<GroupMemberDto[]>(`/groups/${groupId}/members`)
      .then((r) => r.data),

  updateSettings: (groupId: string, dto: UpdateGroupSettingsDto) =>
    apiClient
      .patch<GroupDetailDto>(`/groups/${groupId}/settings`, dto)
      .then((r) => r.data),

  inviteMember: (groupId: string, dto: InviteMemberDto) =>
    apiClient
      .post<InvitationPreviewDto>(`/groups/${groupId}/members/invite`, dto)
      .then((r) => r.data),

  listInvitations: (groupId: string) =>
    apiClient
      .get<GroupInvitationDto[]>(`/groups/${groupId}/invitations`)
      .then((r) => r.data),

  revokeInvitation: (groupId: string, invitationId: string) =>
    apiClient.delete<void>(`/groups/${groupId}/invitations/${invitationId}`),

  removeMember: (groupId: string, userId: string) =>
    apiClient
      .delete<void>(`/groups/${groupId}/members/${userId}`)
      .then((r) => r.data),
};
