import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpsertNoteDto {
  @ApiProperty({ description: '질문 인덱스 (0부터 시작)' })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  questionIndex!: number;

  @ApiProperty()
  @IsString()
  content!: string;
}

export interface NoteAuthorDto {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
}

export interface DiscussionNoteResponseDto {
  id: string;
  discussionId: string;
  userId: string;
  questionIndex: number;
  content: string;
  isPublic: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  user: NoteAuthorDto;
}
