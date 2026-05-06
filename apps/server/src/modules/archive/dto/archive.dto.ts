import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PresignedUrlDto {
  @ApiProperty()
  @IsString()
  key!: string;

  @ApiProperty()
  @IsString()
  contentType!: string;
}

export class CreateArchiveDto {
  @ApiProperty()
  @IsString()
  meetingId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];
}

export class UpdateArchiveDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];
}

export interface ArchiveResponseDto {
  id: string;
  meetingId: string;
  groupId: string;
  userId: string;
  body: string | null;
  photoUrls: string[];
  archivedAt: Date;
}

export interface ArchiveSummaryResponseDto {
  meetingId: string;
  groupId: string;
  content: {
    id: string;
    title: string;
    type: string;
  };
  summary: string | null;
  discussion: {
    generatedBody: string | null;
    editedBody: string | null;
    publishedAt: Date | null;
  } | null;
  meeting: {
    confirmedDate: Date | null;
    status: string;
  };
}
