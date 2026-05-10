import type {
  MeetingDto,
  CreateMeetingDto,
  MeetingAvailabilityDto,
} from '@inos/types';
import { apiClient } from '@/api/client';

export const scheduleApi = {
  getMeetings: (groupId: string) =>
    apiClient.get<MeetingDto[]>(`/groups/${groupId}/meetings`),

  getMeeting: (groupId: string, meetingId: string) =>
    apiClient.get<MeetingDto>(`/groups/${groupId}/meetings/${meetingId}`),

  createMeeting: (groupId: string, data: CreateMeetingDto) =>
    apiClient.post<MeetingDto>(`/groups/${groupId}/meetings`, data),

  submitAvailability: (
    groupId: string,
    meetingId: string,
    data: MeetingAvailabilityDto,
  ) =>
    apiClient.post(
      `/groups/${groupId}/meetings/${meetingId}/availability`,
      data,
    ),

  confirmMeeting: (
    groupId: string,
    meetingId: string,
    confirmedDate: string,
  ) =>
    apiClient.patch(`/groups/${groupId}/meetings/${meetingId}/confirm`, {
      confirmedDate,
    }),
};
