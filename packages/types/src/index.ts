// User DTOs
export interface UserDto {
  id: string;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  isAdmin: boolean;
  createdAt: string;
}

// Admin DTOs
export interface AdminCreateOrgDto {
  name: string;
  description?: string;
  ownerEmail: string;
}

export interface AdminCreateOrgResponseDto {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  ownerEmail: string;
  ownerNickname: string;
  createdAt: string;
}

export interface AdminOrgDto {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  ownerEmail: string;
  ownerNickname: string;
  memberCount: number;
  meetingCount: number;
  createdAt: string;
}

export interface AdminUpdateOrgDto {
  name?: string;
  description?: string;
}

export interface AdminUserDto {
  id: string;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  isAdmin: boolean;
  orgCount: number;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UpdateUserDto {
  nickname?: string;
  profileImageUrl?: string;
}

// Auth DTOs
export interface LoginRedirectDto {
  token: string;
}

// Group / Organization DTOs
export type GroupRole = 'OWNER' | 'MEMBER';

export interface GroupSummaryDto {
  id: string;
  name: string;
  description: string | null;
  myRole: GroupRole;
  memberCount: number;
  createdAt: string;
}

export interface GroupMemberDto {
  id: string;
  userId: string;
  nickname: string;
  profileImageUrl: string | null;
  role: GroupRole;
  joinedAt: string;
}

export interface GroupDetailDto {
  id: string;
  name: string;
  description: string | null;
  greeting: string | null;
  ownerId: string;
  myRole: GroupRole;
  members: GroupMemberDto[];
  createdAt: string;
}

export interface UpdateGroupSettingsDto {
  name?: string;
  description?: string | null;
  greeting?: string | null;
}

// Invitation DTOs
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface InviteMemberDto {
  email: string;
}

export interface InvitationPreviewDto {
  groupId: string;
  groupName: string;
  inviterName: string;
  inviteeEmail: string;
  status: InvitationStatus;
  expiresAt: string;
}

export interface InvitationAcceptResponseDto {
  groupId: string;
}

// Meeting DTOs
export type MeetingStatus = 'PENDING' | 'CONFIRMED' | 'DONE' | 'CANCELLED';

export interface CreateMeetingDto {
  bookTitle?: string;
  bookAuthor?: string;
  movieTitle?: string;
  movieDirector?: string;
  candidateFrom: string;
  candidateTo: string;
  location?: string;
}

export interface UpdateMeetingDto {
  bookTitle?: string;
  bookAuthor?: string;
  movieTitle?: string;
  movieDirector?: string;
  location?: string;
  confirmedDate?: string;
}

export interface MeetingResponderDto {
  userId: string;
  nickname: string;
  availableDates: string[];
}

export interface MeetingNonResponderDto {
  userId: string;
  nickname: string;
}

export interface MeetingDto {
  id: string;
  groupId: string;
  createdById: string;
  bookTitle: string | null;
  bookAuthor: string | null;
  movieTitle: string | null;
  movieDirector: string | null;
  confirmedDate: string | null;
  location: string | null;
  candidateFrom: string;
  candidateTo: string;
  status: MeetingStatus;
  createdAt: string;
  respondedCount: number;
  totalMembers: number;
  discussionId: string | null;
  myAvailability: string[] | null;
  /** 조율 중 날짜별 가능 인원 (PENDING일 때만) */
  dateCounts: Record<string, number> | null;
  /** 조율 중 멤버별 응답 (PENDING일 때만) */
  responses: MeetingResponderDto[] | null;
  /** 조율 중 미응답 멤버 (PENDING일 때만) */
  nonResponders: MeetingNonResponderDto[] | null;
}

export interface SubmitAvailabilityDto {
  availableDates: string[]; // ISO date-only strings
}

export interface SubmitAvailabilityResponseDto {
  confirmed: boolean;
  confirmedDate: string | null;
  respondedCount: number;
  totalMembers: number;
}

// Discussion DTOs
export type PromptKind = 'BOOK' | 'MOVIE';
export type DiscussionStatus = 'GENERATING' | 'GENERATED' | 'PUBLISHED';

export interface DiscussionDto {
  id: string;
  meetingId: string;
  groupId: string;
  status: DiscussionStatus;
  bookPrompts: string[] | null;
  moviePrompts: string[] | null;
  bookContext: string | null;
  movieContext: string | null;
  generatedAt: string | null;
  publishedAt: string | null;
}

export interface UpsertDiscussionNoteDto {
  promptKind: PromptKind;
  questionIndex: number;
  content: string;
  isPublic: boolean;
}

export interface DiscussionNoteDto {
  id: string;
  discussionId: string;
  userId: string;
  promptKind: PromptKind;
  questionIndex: number;
  content: string;
  isPublic: boolean;
  publishedAt: string | null;
  createdAt: string;
  author: {
    nickname: string;
    profileImageUrl: string | null;
  };
}

// Library DTOs
export interface LibraryReviewDto {
  rating: number; // 1~10 (0.5개 단위 별점, 프론트에서 ÷2)
  comment: string | null;
  updatedAt: string;
  updatedByNickname: string | null; // 그룹 리뷰에서만 채워짐
}

export interface LibraryItemDto {
  meetingId: string;
  groupId: string;
  groupName: string;
  kind: PromptKind;
  title: string;
  creator: string | null;
  finishedAt: string | null;
  review: LibraryReviewDto | null;
}

export interface LibraryDto {
  books: LibraryItemDto[];
  movies: LibraryItemDto[];
}

export interface UpsertLibraryReviewDto {
  rating: number; // 1~10
  comment?: string | null;
}

export interface LibraryShareDto {
  /** 공개 상태면 공유 슬러그, 비공개면 null */
  shareId: string | null;
}

export interface SharedLibraryDto {
  ownerNickname: string;
  library: LibraryDto;
}

// SSE stream envelope
export type DiscussionStreamEvent =
  | { type: 'section-start'; section: PromptKind }
  | { type: 'chunk'; section: PromptKind; content: string }
  | { type: 'section-end'; section: PromptKind; prompts: string[] }
  | { type: 'done' }
  | { type: 'error'; message: string };

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

// Paginated API response wrapper
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}
