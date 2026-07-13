import { apiClient } from '@/api/client';
import type {
  InvitationAcceptResponseDto,
  InvitationPreviewDto,
} from '@inos/types';

export const invitationApi = {
  getPreview: (token: string) =>
    apiClient
      .get<InvitationPreviewDto>(`/invitations/${token}`)
      .then((r) => r.data),

  accept: (token: string) =>
    apiClient
      .post<InvitationAcceptResponseDto>(`/invitations/${token}/accept`)
      .then((r) => r.data),
};
