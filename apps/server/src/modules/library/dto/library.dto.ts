import { ApiProperty } from '@nestjs/swagger';
import { PromptKind } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpsertLibraryReviewDto {
  @ApiProperty({ minimum: 1, maximum: 10, description: '1~10 (0.5개 단위 별점, 클라이언트에서 ÷2)' })
  @IsInt()
  @Min(1)
  @Max(10)
  rating!: number;

  @ApiProperty({ required: false, nullable: true, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  comment?: string | null;
}

export class LibraryReviewResponseDto {
  @ApiProperty()
  rating!: number;

  @ApiProperty({ required: false, nullable: true })
  comment!: string | null;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ required: false, nullable: true })
  updatedByNickname!: string | null;
}

export class LibraryItemResponseDto {
  @ApiProperty({ description: 'MEETING이면 모임 id, MANUAL이면 수기 항목 id' })
  meetingId!: string;

  @ApiProperty({ enum: ['MEETING', 'MANUAL'] })
  source!: 'MEETING' | 'MANUAL';

  @ApiProperty({ required: false, nullable: true })
  groupId!: string | null;

  @ApiProperty({ required: false, nullable: true })
  groupName!: string | null;

  @ApiProperty({ enum: ['BOOK', 'MOVIE'] })
  kind!: PromptKind;

  @ApiProperty()
  title!: string;

  @ApiProperty({ required: false, nullable: true })
  creator!: string | null;

  @ApiProperty({ required: false, nullable: true })
  finishedAt!: Date | null;

  @ApiProperty({ type: LibraryReviewResponseDto, required: false, nullable: true })
  review!: LibraryReviewResponseDto | null;

  @ApiProperty({ type: [String], required: false, nullable: true, description: '모임 발제문 (해당 kind 질문 목록)' })
  discussionPrompts!: string[] | null;

  @ApiProperty({ required: false, nullable: true, description: '수기 등록 발제문' })
  discussionText!: string | null;
}

export class CreateManualLibraryEntryDto {
  @ApiProperty({ enum: ['BOOK', 'MOVIE'] })
  @IsEnum(PromptKind)
  kind!: PromptKind;

  @ApiProperty({ maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ required: false, nullable: true, maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  creator?: string | null;

  @ApiProperty({ required: false, nullable: true, example: '2026-07-01' })
  @IsOptional()
  @IsDateString()
  finishedAt?: string | null;

  @ApiProperty({ required: false, nullable: true, maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  discussionText?: string | null;
}

export class UpdateManualLibraryEntryDto {
  @ApiProperty({ required: false, maxLength: 200 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @ApiProperty({ required: false, nullable: true, maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  creator?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsDateString()
  finishedAt?: string | null;

  @ApiProperty({ required: false, nullable: true, maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  discussionText?: string | null;

  @ApiProperty({ required: false, nullable: true, minimum: 1, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  rating?: number | null;

  @ApiProperty({ required: false, nullable: true, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  comment?: string | null;
}

export class LibraryResponseDto {
  @ApiProperty({ type: [LibraryItemResponseDto] })
  books!: LibraryItemResponseDto[];

  @ApiProperty({ type: [LibraryItemResponseDto] })
  movies!: LibraryItemResponseDto[];
}

export class LibraryShareResponseDto {
  @ApiProperty({ required: false, nullable: true, description: '공개면 공유 슬러그, 비공개면 null' })
  shareId!: string | null;
}

export class SharedLibraryResponseDto {
  @ApiProperty({ description: 'PERSONAL이면 닉네임, GROUP이면 오가니제이션 이름' })
  ownerNickname!: string;

  @ApiProperty({ enum: ['PERSONAL', 'GROUP'] })
  scope!: 'PERSONAL' | 'GROUP';

  @ApiProperty({ type: LibraryResponseDto })
  library!: LibraryResponseDto;
}
