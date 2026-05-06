import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import type { MessageEvent } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClaudeService } from '../../shared/claude/claude.service';
import {
  UpdateDiscussionDto,
  AddDiscussionNoteDto,
  DiscussionResponseDto,
  DiscussionNoteResponseDto,
} from './dto/discussion.dto';

@Injectable()
export class DiscussionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly claude: ClaudeService,
  ) {}

  streamGenerate(meetingId: string): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      void (async () => {
        try {
          const meeting = await this.prisma.meeting.findUnique({
            where: { id: meetingId },
            include: {
              groupContent: {
                include: {
                  content: {
                    select: { title: true, synopsis: true, type: true, creator: true },
                  },
                },
              },
            },
          });

          if (!meeting) {
            subscriber.next({
              data: JSON.stringify({ type: 'error', error: '모임을 찾을 수 없습니다' }),
            } as MessageEvent);
            subscriber.complete();
            return;
          }

          const { content } = meeting.groupContent;
          const ragContext = `제목: ${content.title}\n유형: ${content.type}\n창작자: ${content.creator}\n줄거리: ${content.synopsis ?? '없음'}`;

          const discussion = await this.prisma.discussion.upsert({
            where: { meetingId },
            create: {
              meetingId,
              groupId: meeting.groupId,
              groupContentId: meeting.groupContentId,
              ragContext,
              status: 'GENERATING',
            },
            update: { status: 'GENERATING', ragContext },
          });

          const prompt = `다음 콘텐츠에 대한 인문학 모임 발제문을 작성해주세요.\n\n${ragContext}\n\n발제문에는 다음을 포함해주세요:\n1. 주제 소개 및 배경\n2. 핵심 토론 질문 5~7개\n3. 생각해볼 관점들\n4. 모임 진행 가이드`;
          const system =
            '당신은 인문학 모임 발제문 전문 작성자입니다. 깊이 있는 토론을 이끌어낼 수 있는 발제문을 한국어로 작성하세요. 웹 검색을 활용해 최신 정보와 다양한 관점을 포함하세요.';

          let fullText = '';

          for await (const chunk of this.claude.streamText(prompt, system)) {
            fullText += chunk;
            subscriber.next({
              data: JSON.stringify({ type: 'chunk', content: chunk }),
            } as MessageEvent);
          }

          await this.prisma.discussion.update({
            where: { id: discussion.id },
            data: {
              generatedBody: fullText,
              status: 'GENERATED',
              generatedAt: new Date(),
            },
          });

          subscriber.next({
            data: JSON.stringify({ type: 'done' }),
          } as MessageEvent);
          subscriber.complete();
        } catch (error) {
          subscriber.next({
            data: JSON.stringify({
              type: 'error',
              error: (error as Error).message,
            }),
          } as MessageEvent);
          subscriber.complete();
        }
      })();
    });
  }

  streamPersonal(contentId: string, userId: string): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      void (async () => {
        try {
          const [content, user] = await Promise.all([
            this.prisma.content.findUnique({
              where: { id: contentId },
              select: { title: true, synopsis: true, type: true, creator: true },
            }),
            this.prisma.user.findUnique({
              where: { id: userId },
              select: { tasteProfile: true },
            }),
          ]);

          if (!content) {
            subscriber.next({
              data: JSON.stringify({ type: 'error', error: '콘텐츠를 찾을 수 없습니다' }),
            } as MessageEvent);
            subscriber.complete();
            return;
          }

          const profileText = JSON.stringify(user?.tasteProfile ?? '취향 정보 없음');
          const prompt = `다음 콘텐츠에 대한 개인 감상 질문을 생성해주세요.\n\n콘텐츠: ${content.title} (${content.type})\n줄거리: ${content.synopsis ?? '없음'}\n\n사용자 취향: ${profileText}\n\n개인적인 성찰과 감상을 이끌어낼 질문 5개를 제시해주세요.`;
          const system =
            '당신은 인문학적 감상과 성찰을 돕는 전문가입니다. 사용자의 취향에 맞춰 개인적이고 깊이 있는 질문을 한국어로 제시하세요.';

          for await (const chunk of this.claude.streamText(prompt, system)) {
            subscriber.next({
              data: JSON.stringify({ type: 'chunk', content: chunk }),
            } as MessageEvent);
          }

          subscriber.next({ data: JSON.stringify({ type: 'done' }) } as MessageEvent);
          subscriber.complete();
        } catch (error) {
          subscriber.next({
            data: JSON.stringify({ type: 'error', error: (error as Error).message }),
          } as MessageEvent);
          subscriber.complete();
        }
      })();
    });
  }

  async findByMeetingId(meetingId: string): Promise<DiscussionResponseDto> {
    const discussion = await this.prisma.discussion.findUnique({
      where: { meetingId },
      include: { notes: true },
    });
    if (!discussion) throw new NotFoundException('발제문을 찾을 수 없습니다');
    return this.mapToDto(discussion);
  }

  async findById(id: string): Promise<DiscussionResponseDto> {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id },
      include: { notes: true },
    });
    if (!discussion) throw new NotFoundException('발제문을 찾을 수 없습니다');
    return this.mapToDto(discussion);
  }

  async update(id: string, dto: UpdateDiscussionDto): Promise<DiscussionResponseDto> {
    const existing = await this.prisma.discussion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('발제문을 찾을 수 없습니다');

    const updated = await this.prisma.discussion.update({
      where: { id },
      data: { editedBody: dto.editedBody },
      include: { notes: true },
    });
    return this.mapToDto(updated);
  }

  async publish(id: string): Promise<DiscussionResponseDto> {
    const existing = await this.prisma.discussion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('발제문을 찾을 수 없습니다');
    if (existing.status === 'GENERATING') {
      throw new BadRequestException('발제문 생성 중입니다. 완료 후 발행해주세요.');
    }

    const updated = await this.prisma.discussion.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
      include: { notes: true },
    });
    return this.mapToDto(updated);
  }

  async addNote(
    discussionId: string,
    userId: string,
    dto: AddDiscussionNoteDto,
  ): Promise<DiscussionNoteResponseDto> {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
    });
    if (!discussion) throw new NotFoundException('발제문을 찾을 수 없습니다');

    const note = await this.prisma.discussionNote.create({
      data: { discussionId, userId, content: dto.content },
    });
    return {
      id: note.id,
      discussionId: note.discussionId,
      userId: note.userId,
      content: note.content,
      createdAt: note.createdAt,
    };
  }

  private mapToDto(
    discussion: {
      id: string;
      meetingId: string;
      groupId: string;
      groupContentId: string;
      status: string;
      generatedBody: string | null;
      editedBody: string | null;
      generatedAt: Date | null;
      publishedAt: Date | null;
      notes?: Array<{
        id: string;
        discussionId: string;
        userId: string;
        content: string;
        createdAt: Date;
      }>;
    },
  ): DiscussionResponseDto {
    return {
      id: discussion.id,
      meetingId: discussion.meetingId,
      groupId: discussion.groupId,
      groupContentId: discussion.groupContentId,
      status: discussion.status,
      generatedBody: discussion.generatedBody,
      editedBody: discussion.editedBody,
      generatedAt: discussion.generatedAt,
      publishedAt: discussion.publishedAt,
      notes: discussion.notes?.map((n) => ({
        id: n.id,
        discussionId: n.discussionId,
        userId: n.userId,
        content: n.content,
        createdAt: n.createdAt,
      })),
    };
  }
}
