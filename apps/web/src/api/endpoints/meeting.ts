import { apiClient } from '@/api/client';
import type {
  CreateMeetingDto,
  DiscussionImpressionDto,
  MeetingDto,
  SubmitAvailabilityDto,
  SubmitAvailabilityResponseDto,
  UpdateMeetingDto,
} from '@inos/types';

export const meetingApi = {
  list: (groupId: string) =>
    apiClient
      .get<MeetingDto[]>(`/groups/${groupId}/meetings`)
      .then((r) => r.data),

  getById: (groupId: string, meetingId: string) =>
    apiClient
      .get<MeetingDto>(`/groups/${groupId}/meetings/${meetingId}`)
      .then((r) => r.data),

  create: (groupId: string, dto: CreateMeetingDto) =>
    apiClient
      .post<MeetingDto>(`/groups/${groupId}/meetings`, dto)
      .then((r) => r.data),

  update: (groupId: string, meetingId: string, dto: UpdateMeetingDto) =>
    apiClient
      .patch<MeetingDto>(`/groups/${groupId}/meetings/${meetingId}`, dto)
      .then((r) => r.data),

  remove: (groupId: string, meetingId: string) =>
    apiClient.delete<void>(`/groups/${groupId}/meetings/${meetingId}`),

  submitAvailability: (
    groupId: string,
    meetingId: string,
    dto: SubmitAvailabilityDto,
  ) =>
    apiClient
      .post<SubmitAvailabilityResponseDto>(
        `/groups/${groupId}/meetings/${meetingId}/availability`,
        dto,
      )
      .then((r) => r.data),

  finish: (groupId: string, meetingId: string) =>
    apiClient
      .post<MeetingDto>(`/groups/${groupId}/meetings/${meetingId}/done`)
      .then((r) => r.data),

  listImpressions: (groupId: string, meetingId: string) =>
    apiClient
      .get<DiscussionImpressionDto[]>(
        `/groups/${groupId}/meetings/${meetingId}/impressions`,
      )
      .then((r) => r.data),

  upsertImpression: (groupId: string, meetingId: string, content: string) =>
    apiClient
      .put<DiscussionImpressionDto | null>(
        `/groups/${groupId}/meetings/${meetingId}/impression`,
        { content },
      )
      .then((r) => r.data),
};
