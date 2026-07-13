import { ApiProperty } from '@nestjs/swagger';
import { MeetingStatus } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
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
}

export class SubmitAvailabilityDto {
  @ApiProperty({ type: [String], example: ['2026-07-15', '2026-07-16'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsDateString({}, { each: true })
  availableDates!: string[];
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

  @ApiProperty({ required: false, nullable: true })
  myAvailability!: string[] | null;

  @ApiProperty({
    required: false,
    nullable: true,
    description: '조율 중 날짜별 가능 인원 (PENDING일 때만)',
  })
  dateCounts!: Record<string, number> | null;
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
