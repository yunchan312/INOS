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

export interface AuthTokensDto {
  token: string;
  refreshToken: string;
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

export interface GroupInvitationDto {
  id: string;
  email: string;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
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
  /** 선호 시간 메모 (예: "저녁 7시 이후") */
  timeNote: string | null;
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
  /** 발제문 생성 상태 (없으면 null — 확정 직후 큐 대기 중일 수 있음) */
  discussionStatus: DiscussionStatus | null;
  myAvailability: string[] | null;
  /** 내가 제출한 선호 시간 메모 */
  myTimeNote: string | null;
  /** 조율 중 날짜별 가능 인원 (PENDING일 때만) */
  dateCounts: Record<string, number> | null;
  /** 조율 중 멤버별 응답 (PENDING일 때만) */
  responses: MeetingResponderDto[] | null;
  /** 조율 중 미응답 멤버 (PENDING일 때만) */
  nonResponders: MeetingNonResponderDto[] | null;
}

export interface SubmitAvailabilityDto {
  availableDates: string[]; // ISO date-only strings
  /** 선호 시간 메모 (선택, 최대 80자) */
  timeNote?: string | null;
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

export type LibraryItemSource = 'MEETING' | 'MANUAL';

export interface LibraryItemDto {
  /** MEETING이면 모임 id, MANUAL이면 수기 항목 id */
  meetingId: string;
  source: LibraryItemSource;
  groupId: string | null;
  groupName: string | null;
  kind: PromptKind;
  title: string;
  creator: string | null;
  finishedAt: string | null;
  review: LibraryReviewDto | null;
  /** 모임 발제문 (해당 kind의 질문 목록) */
  discussionPrompts: string[] | null;
  /** 수기 등록 발제문 (자유 텍스트) */
  discussionText: string | null;
}

export interface CreateManualLibraryEntryDto {
  kind: PromptKind;
  title: string;
  creator?: string | null;
  finishedAt?: string | null; // ISO date
  discussionText?: string | null;
}

export interface UpdateManualLibraryEntryDto {
  title?: string;
  creator?: string | null;
  finishedAt?: string | null;
  discussionText?: string | null;
  rating?: number | null; // 1~10
  comment?: string | null;
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
  /** PERSONAL이면 사용자 닉네임, GROUP이면 오가니제이션 이름 */
  ownerNickname: string;
  scope: 'PERSONAL' | 'GROUP';
  library: LibraryDto;
}

export interface DiscussionCustomPromptDto {
  id: string;
  promptKind: PromptKind;
  content: string;
  /** 노트 키 (100번대 고정값 — 삭제돼도 재사용하지 않음) */
  noteIndex: number;
  authorId: string;
  authorNickname: string;
  createdAt: string;
}

export interface CreateCustomPromptDto {
  promptKind: PromptKind;
  content: string;
}

export interface DiscussionImpressionDto {
  userId: string;
  nickname: string;
  content: string;
  updatedAt: string;
}

export interface UpsertImpressionDto {
  /** 빈 문자열이면 감상 삭제 */
  content: string;
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

// ─── 오가니제이션 게시판 (하고싶은 말) ───────────────────────────

export interface GroupPostSummaryDto {
  id: string;
  groupId: string;
  authorId: string;
  authorNickname: string;
  title: string;
  likeCount: number;
  likedByMe: boolean;
  createdAt: string;
}

export interface GroupPostDto extends GroupPostSummaryDto {
  /** 마크다운 원문 */
  content: string;
  updatedAt: string;
}

export interface GroupPostListDto {
  items: GroupPostSummaryDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateGroupPostDto {
  title: string;
  content: string;
}

export interface UpdateGroupPostDto {
  title?: string;
  content?: string;
}

export interface GroupPostLikeDto {
  likeCount: number;
  likedByMe: boolean;
}

// ─── 오가니제이션 링크 초대 ───────────────────────────────────────

export interface GroupInviteLinkDto {
  /** 공유용 전체 URL */
  url: string;
  token: string;
  expiresAt: string;
  useCount: number;
  createdAt: string;
}

export interface InviteLinkPreviewDto {
  groupName: string;
  inviterName: string;
  memberCount: number;
  /** 만료 또는 철회됨 */
  expired: boolean;
}

export interface InviteLinkAcceptResponseDto {
  groupId: string;
}

// ─── 로컬(이메일/비밀번호) 인증 ──────────────────────────────────

export interface LocalSignupDto {
  email: string;
  password: string;
  nickname: string;
}

export interface LocalLoginDto {
  email: string;
  password: string;
}
