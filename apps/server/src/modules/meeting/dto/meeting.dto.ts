import { ApiProperty } from '@nestjs/swagger';
import { DiscussionStatus, MeetingStatus } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateMeetingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bookTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bookAuthor?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  movieTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  movieDirector?: string;

  @ApiProperty({ example: '2026-07-15' })
  @IsDateString()
  candidateFrom!: string;

  @ApiProperty({ example: '2026-07-25' })
  @IsDateString()
  candidateTo!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;
}

export class UpdateMeetingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bookTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bookAuthor?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  movieTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  movieDirector?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  confirmedDate?: string;

  @ApiProperty({
    required: false,
    nullable: true,
    example: '19:30',
    description: '모임 시작 시각 "HH:mm" — null이면 시간 미정으로 초기화',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: '시간은 HH:mm 형식이어야 합니다',
  })
  confirmedTime?: string | null;
}

// 발제문 재생성 — 작품 정보를 고쳐서 함께 보낼 수 있다 (생략하면 기존 값 유지)
export class RetryDiscussionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bookTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bookAuthor?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  movieTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  movieDirector?: string;
}

export class SubmitAvailabilityDto {
  @ApiProperty({ type: [String], example: ['2026-07-15', '2026-07-16'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsDateString({}, { each: true })
  availableDates!: string[];

  @ApiProperty({ required: false, nullable: true, maxLength: 80, example: '저녁 7시 이후 가능해요' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  timeNote?: string | null;
}

export class MeetingResponderDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty()
  nickname!: string;

  @ApiProperty({ type: [String] })
  availableDates!: string[];

  @ApiProperty({ required: false, nullable: true })
  timeNote!: string | null;
}

export class MeetingNonResponderDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty()
  nickname!: string;
}

export class MeetingResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  groupId!: string;

  @ApiProperty()
  createdById!: string;

  @ApiProperty({ required: false, nullable: true })
  bookTitle!: string | null;

  @ApiProperty({ required: false, nullable: true })
  bookAuthor!: string | null;

  @ApiProperty({ required: false, nullable: true })
  movieTitle!: string | null;

  @ApiProperty({ required: false, nullable: true })
  movieDirector!: string | null;

  @ApiProperty()
  candidateFrom!: Date;

  @ApiProperty()
  candidateTo!: Date;

  @ApiProperty({ required: false, nullable: true })
  confirmedDate!: Date | null;

  @ApiProperty({ required: false, nullable: true, example: '19:30' })
  confirmedTime!: string | null;

  @ApiProperty({ required: false, nullable: true })
  location!: string | null;

  @ApiProperty({ enum: ['PENDING', 'CONFIRMED', 'DONE', 'CANCELLED'] })
  status!: MeetingStatus;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  respondedCount!: number;

  @ApiProperty()
  totalMembers!: number;

  @ApiProperty({ required: false, nullable: true })
  discussionId!: string | null;

  @ApiProperty({
    enum: ['GENERATING', 'GENERATED', 'PUBLISHED'],
    required: false,
    nullable: true,
    description: '발제문 생성 상태 (없으면 null)',
  })
  discussionStatus!: DiscussionStatus | null;

  @ApiProperty({ required: false, nullable: true })
  myAvailability!: string[] | null;

  @ApiProperty({ required: false, nullable: true, description: '내가 제출한 선호 시간 메모' })
  myTimeNote!: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    description: '조율 중 날짜별 가능 인원 (PENDING일 때만)',
  })
  dateCounts!: Record<string, number> | null;

  @ApiProperty({
    type: [MeetingResponderDto],
    required: false,
    nullable: true,
    description: '조율 중 멤버별 응답 (PENDING일 때만)',
  })
  responses!: MeetingResponderDto[] | null;

  @ApiProperty({
    type: [MeetingNonResponderDto],
    required: false,
    nullable: true,
    description: '조율 중 미응답 멤버 (PENDING일 때만)',
  })
  nonResponders!: MeetingNonResponderDto[] | null;
}

export class SubmitAvailabilityResponseDto {
  @ApiProperty()
  confirmed!: boolean;

  @ApiProperty({ required: false, nullable: true })
  confirmedDate!: Date | null;

  @ApiProperty()
  respondedCount!: number;

  @ApiProperty()
  totalMembers!: number;
}
