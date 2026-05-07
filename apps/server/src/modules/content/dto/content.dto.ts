import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ContentType {
  MOVIE = 'MOVIE',
  BOOK = 'BOOK',
}

export class ListContentDto {
  @ApiPropertyOptional({ enum: ContentType, default: ContentType.MOVIE })
  @IsOptional()
  @IsEnum(ContentType)
  type?: ContentType = ContentType.MOVIE;

  @ApiPropertyOptional({ description: '마지막 항목 id (무한 스크롤 커서)' })
  @IsOptional()
  @IsString()
  cursor?: string;
}

export class SearchContentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ enum: ContentType })
  @IsOptional()
  @IsEnum(ContentType)
  type?: ContentType;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}

export class AddGroupContentDto {
  @ApiProperty()
  @IsString()
  contentId!: string;
}

export class AddUserContentDto {
  @ApiProperty()
  @IsString()
  contentId!: string;
}

export class VoteGroupContentDto {
  @ApiProperty()
  @IsString()
  groupContentId!: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  score!: number;
}

export class UpdateGroupContentStatusDto {
  @ApiProperty({ enum: ['VOTING', 'SELECTED', 'COMPLETED', 'CANCELLED'] })
  @IsString()
  status!: string;
}

export class UpdateUserContentDto {
  @ApiPropertyOptional({ enum: ['COMPLETED', 'IN_PROGRESS', 'WISHLIST'] })
  @IsOptional()
  @IsString()
  status?: string;
}

export interface ContentResponseDto {
  id: string;
  title: string;
  type: string;
  creator: string;
  releaseYear: number | null;
  thumbnailUrl: string | null;
  synopsis: string | null;
}

export interface ContentListResponseDto {
  items: ContentResponseDto[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface GroupContentResponseDto {
  id: string;
  groupId: string;
  contentId: string;
  status: string;
  selectedAt: Date;
  avgScore: number;
  voteCount: number;
  content: ContentResponseDto;
}

export interface UserContentResponseDto {
  id: string;
  contentId: string;
  status: string;
  createdAt: Date;
  content: ContentResponseDto;
}
