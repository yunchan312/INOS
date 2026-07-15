import { ApiProperty } from '@nestjs/swagger';
import { PromptKind } from '@prisma/client';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

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
  @ApiProperty()
  meetingId!: string;

  @ApiProperty()
  groupId!: string;

  @ApiProperty()
  groupName!: string;

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
  @ApiProperty()
  ownerNickname!: string;

  @ApiProperty({ type: LibraryResponseDto })
  library!: LibraryResponseDto;
}
