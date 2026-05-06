// Auth DTOs
export interface GoogleOAuthUserDto {
  email: string;
  nickname: string;
  profileImageUrl?: string;
  oauthId: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

// User DTOs
export interface UserDto {
  id: string;
  email: string;
  nickname: string;
  profileImageUrl?: string | null;
  createdAt: Date;
}

// Group DTOs
export type GroupMode = 'GROUP' | 'SOLO';
export type GroupRole = 'LEADER' | 'MEMBER';

export interface CreateGroupDto {
  name: string;
  description?: string;
  mode?: GroupMode;
}

export interface GroupDto {
  id: string;
  name: string;
  description?: string | null;
  inviteCode: string;
  mode: GroupMode;
  createdAt: Date;
}

export interface GroupMemberDto {
  id: string;
  userId: string;
  groupId: string;
  role: GroupRole;
  joinedAt: Date;
  user?: UserDto;
}

// Content DTOs
export type ContentType = 'MOVIE' | 'BOOK';
export type ContentSource = 'TMDB' | 'KAKAO' | 'GOOGLE_BOOKS' | 'USER_ADDED';
export type GroupContentStatus = 'VOTING' | 'SELECTED' | 'COMPLETED' | 'CANCELLED';
export type UserContentStatus = 'COMPLETED' | 'IN_PROGRESS' | 'WISHLIST';

export interface ContentDto {
  id: string;
  type: ContentType;
  title: string;
  creator: string;
  releaseYear?: number | null;
  thumbnailUrl?: string | null;
  synopsis?: string | null;
  source: ContentSource;
}

export interface CreateGroupContentDto {
  contentId: string;
}

export interface VoteContentDto {
  score: number;
}

// Meeting DTOs
export type MeetingStatus = 'PENDING' | 'CONFIRMED' | 'DONE' | 'CANCELLED';

export interface CreateMeetingDto {
  groupContentId: string;
  location?: string;
}

export interface MeetingAvailabilityDto {
  availableDates: string[];
}

export interface MeetingDto {
  id: string;
  groupId: string;
  groupContentId: string;
  confirmedDate?: Date | null;
  location?: string | null;
  status: MeetingStatus;
  createdAt: Date;
}

// Discussion DTOs
export type DiscussionStatus = 'GENERATING' | 'GENERATED' | 'PUBLISHED';

export interface DiscussionDto {
  id: string;
  meetingId: string;
  groupId: string;
  groupContentId: string;
  status: DiscussionStatus;
  generatedBody?: string | null;
  editedBody?: string | null;
  generatedAt?: Date | null;
  publishedAt?: Date | null;
}

export interface CreateDiscussionNoteDto {
  content: string;
}

// Archive DTOs
export interface CreateArchiveDto {
  body?: string;
  photoUrls?: string[];
}

export interface ArchiveDto {
  id: string;
  meetingId: string;
  groupId: string;
  userId: string;
  body?: string | null;
  photoUrls?: string[] | null;
  archivedAt: Date;
}

// SSE DTOs
export interface SseDiscussionChunkDto {
  type: 'chunk' | 'done' | 'error';
  content?: string;
  error?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}
