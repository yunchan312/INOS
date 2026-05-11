import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DiscussionNoteResponseDto } from './dto/discussion.dto';

@Injectable()
export class DiscussionService {
  constructor(private readonly prisma: PrismaService) {}

  async assertCanGenerate(groupContentId: string, groupId: string): Promise<void> {
    const memberCount = await this.prisma.groupMember.count({ where: { groupId } });
    const likeCount = await this.prisma.contentVote.count({
      where: { groupContentId, liked: true },
    });

    if (likeCount < Math.ceil(memberCount / 2)) {
      throw new HttpException(
        '구성원 50% 이상의 좋아요가 필요합니다.',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async upsertNote(
    discussionId: string,
    userId: string,
    questionIndex: number,
    content: string,
  ): Promise<DiscussionNoteResponseDto> {
    const existing = await this.prisma.discussionNote.findUnique({
      where: { discussionId_userId_questionIndex: { discussionId, userId, questionIndex } },
    });

    if (existing?.isPublic) {
      throw new HttpException('공개된 답변은 수정할 수 없습니다.', HttpStatus.FORBIDDEN);
    }

    return this.prisma.discussionNote.upsert({
      where: { discussionId_userId_questionIndex: { discussionId, userId, questionIndex } },
      create: { discussionId, userId, questionIndex, content },
      update: { content },
      include: {
        user: { select: { id: true, nickname: true, profileImageUrl: true } },
      },
    });
  }

  async getNotes(
    discussionId: string,
    userId: string,
  ): Promise<DiscussionNoteResponseDto[]> {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
      include: { meeting: true },
    });

    if (!discussion) throw new NotFoundException('발제문을 찾을 수 없습니다.');

    const isAfterMeeting =
      discussion.meeting.confirmedDate != null &&
      new Date() >= new Date(discussion.meeting.confirmedDate);

    const notes = await this.prisma.discussionNote.findMany({
      where: { discussionId },
      include: {
        user: { select: { id: true, nickname: true, profileImageUrl: true } },
      },
    });

    return notes.filter(
      (note) => note.userId === userId || (isAfterMeeting && note.isPublic),
    );
  }

  async publishNote(
    discussionId: string,
    userId: string,
    questionIndex: number,
  ): Promise<DiscussionNoteResponseDto> {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
      include: { meeting: true },
    });

    if (!discussion) throw new NotFoundException('발제문을 찾을 수 없습니다.');

    if (
      !discussion.meeting.confirmedDate ||
      new Date() < new Date(discussion.meeting.confirmedDate)
    ) {
      throw new HttpException(
        '모임 날짜 이후에만 공개할 수 있습니다.',
        HttpStatus.FORBIDDEN,
      );
    }

    const note = await this.prisma.discussionNote.findUnique({
      where: { discussionId_userId_questionIndex: { discussionId, userId, questionIndex } },
    });

    if (!note) {
      throw new HttpException('답변을 먼저 작성해주세요.', HttpStatus.BAD_REQUEST);
    }

    return this.prisma.discussionNote.update({
      where: { discussionId_userId_questionIndex: { discussionId, userId, questionIndex } },
      data: { isPublic: true, publishedAt: new Date() },
      include: {
        user: { select: { id: true, nickname: true, profileImageUrl: true } },
      },
    });
  }
}
