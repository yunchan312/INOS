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

// TMDB DTOs
// 런타임 값(이미지 URL 조립, 출처 문구)은 apps/web/src/lib/tmdb.ts에 있다 —
// 이 패키지는 타입 전용이라 CJS dist에서 named export를 꺼낼 수 없다.

export type TmdbPosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780';
export type TmdbBackdropSize = 'w300' | 'w780' | 'w1280';

/** 검색 자동완성 한 줄 (선택 전이라 아직 저장되지 않은 후보) */
export interface TmdbMovieSearchItemDto {
  tmdbId: number;
  title: string;
  originalTitle: string | null;
  director: string | null;
  releaseYear: number | null;
  posterPath: string | null;
}

/** 저장된 영화 정보 */
export interface MovieWorkDto {
  tmdbId: number;
  title: string;
  originalTitle: string | null;
  director: string | null;
  /** ISO date-only ("2024-09-07") */
  releaseDate: string | null;
  /** 분 단위 상영시간 */
  runtime: number | null;
  overview: string | null;
  genres: string[];
  /** TMDB 경로 조각 — tmdbImageUrl()로 변환해서 사용 */
  posterPath: string | null;
  backdropPath: string | null;
  /** 한국 관람등급 */
  certification: string | null;
}

// 국립중앙도서관 서지정보(SEOJI) DTOs
// TMDB와 달리 표지·책소개는 완성된 절대 URL로 내려오므로 조립 유틸이 필요 없다.

/** 검색 자동완성 한 줄 (선택 전이라 아직 저장되지 않은 후보) */
export interface SeojiBookSearchItemDto {
  /** 13자리 ISBN (EA_ISBN) — 책을 확정할 때 쓰는 키 */
  isbn13: string;
  title: string;
  /** SEOJI 원문 그대로 ("한강 지음"처럼 역할어가 붙어 있을 수 있다) */
  author: string | null;
  publisher: string | null;
  publishYear: number | null;
  coverUrl: string | null;
}

/** 저장된 책 정보 */
export interface BookWorkDto {
  isbn13: string;
  /** 세트 ISBN (전집의 낱권이면 값이 있다) */
  setIsbn: string | null;
  title: string;
  seriesTitle: string | null;
  author: string | null;
  publisher: string | null;
  /** ISO date-only ("2024-03-15") */
  publishDate: string | null;
  /** 쪽수 */
  page: number | null;
  /** 한국십진분류 */
  kdc: string | null;
  /** KDC 대분류 주제명 */
  subject: string | null;
  coverUrl: string | null;
  /** 책소개 원문 URL — 본문은 아직 가져오지 않는다 */
  introductionUrl: string | null;
  /** 목차 원문 URL */
  tocUrl: string | null;
}

// Meeting DTOs
export type MeetingStatus = 'PENDING' | 'CONFIRMED' | 'DONE' | 'CANCELLED';

export interface CreateMeetingDto {
  bookTitle?: string;
  bookAuthor?: string;
  /** 국중도에서 고른 책. 주면 bookTitle/bookAuthor는 SEOJI 값으로 채워진다 */
  bookIsbn?: string;
  movieTitle?: string;
  movieDirector?: string;
  /** TMDB에서 고른 영화. 주면 movieTitle/movieDirector는 TMDB 값으로 채워진다 */
  movieTmdbId?: number;
  candidateFrom: string;
  candidateTo: string;
  location?: string;
}

export interface UpdateMeetingDto {
  bookTitle?: string;
  bookAuthor?: string;
  /** 국중도에서 고른 책. 주면 bookTitle/bookAuthor는 SEOJI 값으로 채워진다 */
  bookIsbn?: string;
  movieTitle?: string;
  movieDirector?: string;
  /** TMDB에서 고른 영화. 주면 movieTitle/movieDirector는 TMDB 값으로 채워진다 */
  movieTmdbId?: number;
  location?: string;
  confirmedDate?: string;
  /** 모임 시작 시각 "HH:mm" — null이면 시간 미정으로 초기화 */
  confirmedTime?: string | null;
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
  /** 국중도로 식별된 책 정보 (자유 입력만 했으면 null) */
  bookWork: BookWorkDto | null;
  movieTitle: string | null;
  movieDirector: string | null;
  /** TMDB로 식별된 영화 정보 (자유 입력만 했으면 null) */
  movieWork: MovieWorkDto | null;
  confirmedDate: string | null;
  /** 모임 시작 시각 "HH:mm" (null이면 미정) */
  confirmedTime: string | null;
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
export type DiscussionStatus =
  | 'GENERATING'
  | 'GENERATED'
  | 'PUBLISHED'
  | 'FAILED';

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

// ─── 알림함 ─────────────────────────────────────────────────────

export type NotificationType =
  | 'DATE_CONFIRMED'
  | 'DISCUSSION_READY'
  | 'MEETING_REMINDER_3H'
  | 'AVAILABILITY_REMINDER';

export interface NotificationDto {
  id: string;
  type: NotificationType;
  sentAt: string;
  readAt: string | null;
  meetingId: string;
  groupId: string;
  groupName: string;
  /** 작품 표기 (책 · 영화) */
  workLabel: string;
  confirmedDate: string | null;
  confirmedTime: string | null;
}

export interface NotificationListDto {
  items: NotificationDto[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
}

// ─── 랜딩 쇼케이스 (공개) ────────────────────────────────────────

/** 랜딩 서가에 꽂히는 인기 도서 한 권 */
/** 랜딩 서가에 꽂히는 책 한 권 (API가 아니라 웹의 큐레이션 목록이 채운다) */
export interface ShowcaseBookDto {
  title: string;
  author: string | null;
  /** 표지 전체 URL. 외부 API가 주는 형태가 제각각이라 경로 조각이 아닌 완성 URL */
  coverUrl: string | null;
}

/** 랜딩 서가에 걸리는 인기 영화 한 편 */
export interface ShowcaseMovieDto {
  tmdbId: number;
  title: string;
  releaseYear: number | null;
  /** TMDB 경로 조각 — tmdbImageUrl()로 변환해서 쓴다 */
  posterPath: string | null;
}

/**
 * 랜딩 페이지용 인기 작품 묶음 — 영화만 외부에서 받아온다.
 * 서가의 책은 랭킹을 주는 무료 API가 없어 웹의 큐레이션 목록을 그대로 쓴다.
 * TMDB가 죽으면 movies가 빈 배열로 내려가고 화면이 자체 폴백을 채운다.
 */
export interface ShowcaseDto {
  movies: ShowcaseMovieDto[];
}
