import { apiClient } from '@/api/client';
import type {
  AdminCreateOrgDto,
  AdminCreateOrgResponseDto,
  AdminOrgDto,
  AdminUpdateOrgDto,
  AdminUserDto,
  Paginated,
} from '@inos/types';

export interface AdminOrgListParams {
  search?: string;
  member?: string;
  minMembers?: number;
  page?: number;
}

export interface AdminUserListParams {
  search?: string;
  joinedAfter?: string;
  adminOnly?: boolean;
  page?: number;
}

function compact(params: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== '' && v !== false && v !== 0,
    ),
  );
}

export const adminApi = {
  listOrgs: (params: AdminOrgListParams) =>
    apiClient
      .get<Paginated<AdminOrgDto>>('/admin/orgs', {
        params: compact({ page: 1, ...params }),
      })
      .then((r) => r.data),

  listUsers: (params: AdminUserListParams) =>
    apiClient
      .get<Paginated<AdminUserDto>>('/admin/users', {
        params: compact({ page: 1, ...params }),
      })
      .then((r) => r.data),

  setUserAdmin: (userId: string, isAdmin: boolean) =>
    apiClient
      .patch<{ id: string; isAdmin: boolean }>(`/admin/users/${userId}/admin`, {
        isAdmin,
      })
      .then((r) => r.data),

  deleteUser: (userId: string) =>
    apiClient.delete(`/admin/users/${userId}`).then(() => undefined),

  createOrg: (dto: AdminCreateOrgDto) =>
    apiClient
      .post<AdminCreateOrgResponseDto>('/admin/orgs', dto)
      .then((r) => r.data),

  updateOrg: (orgId: string, dto: AdminUpdateOrgDto) =>
    apiClient
      .patch<AdminOrgDto>(`/admin/orgs/${orgId}`, dto)
      .then((r) => r.data),

  deleteOrg: (orgId: string) =>
    apiClient.delete(`/admin/orgs/${orgId}`).then(() => undefined),
};
