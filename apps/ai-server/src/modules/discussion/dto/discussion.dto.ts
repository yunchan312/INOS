import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateDiscussionDto {
  @IsString()
  @IsNotEmpty()
  editedBody!: string;
}

export class AddDiscussionNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;
}

export class PersonalStreamQueryDto {
  @IsString()
  @IsNotEmpty()
  contentId!: string;
}

export interface DiscussionNoteResponseDto {
  id: string;
  discussionId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface DiscussionResponseDto {
  id: string;
  meetingId: string;
  groupId: string;
  groupContentId: string;
  status: string;
  generatedBody: string | null;
  editedBody: string | null;
  generatedAt: Date | null;
  publishedAt: Date | null;
  notes?: DiscussionNoteResponseDto[];
}
