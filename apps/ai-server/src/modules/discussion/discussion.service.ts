import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import type { MessageEvent } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClaudeService } from '../../shared/claude/claude.service';
import type {
  DiscussionCustomPromptDto,
  DiscussionDto,
  DiscussionNoteDto,
  UpsertDiscussionNoteDto,
} from '@inos/types';
import {
  CreateCustomPromptDto,
  UpsertNoteDto,
} from './dto/discussion.dto';

const SYSTEM_PROMPT = `당신은 인문학 모임 전문 사회자이자 발제문 작성 전문가입니다.
웹 검색을 활용하여 책이나 영화의 실제 내용, 맥락, 비평적 관점을 정확히 파악하세요.
각 발제 질문은 참가자들이 깊이 있는 토론을 나눌 수 있도록, 단순한 사실 확인이 아닌
성찰과 논의를 유도하는 방향으로 한국어로 작성하세요.`;

function buildBookPrompt(title: string, author: string): string {
  return `책 "${title}" (저자: ${author})에 대한 인문학 모임 발제 질문 5개를 작성해주세요.

반드시 다음 형식으로 작성하세요:
1. (질문 내용)
2. (질문 내용)
3. (질문 내용)
4. (질문 내용)
5. (질문 내용)

질문 줄에는 굵게(**) 등 마크다운 장식을 쓰지 말고, 숫자로 시작하는 한 줄로 작성하세요.
각 질문은 단순 사실 확인보다 참가자의 성찰, 가치관, 삶과의 연결을 이끌어낼 수 있어야 합니다.`;
}

function buildMoviePrompt(title: string, director: string): string {
  return `영화 "${title}" (감독: ${director})에 대한 인문학 모임 발제 질문 5개를 작성해주세요.

반드시 다음 형식으로 작성하세요:
1. (질문 내용)
2. (질문 내용)
3. (질문 내용)
4. (질문 내용)
5. (질문 내용)

질문 줄에는 굵게(**) 등 마크다운 장식을 쓰지 말고, 숫자로 시작하는 한 줄로 작성하세요.
각 질문은 단순 사실 확인보다 참가자의 성찰, 가치관, 삶과의 연결을 이끌어낼 수 있어야 합니다.`;
}

function parsePrompts(text: string): string[] {
  const prompts: string[] = [];
  for (const rawLine of text.split('\n')) {
    // "**1. 질문**", "### 1) 질문" 같은 마크다운 장식을 허용
    const line = rawLine.trim().replace(/^[#>*\s]+/, '');
    const m = line.match(/^(\d+)[.、)]\s*(.+)/);
    if (m && Number(m[1]) >= 1 && Number(m[1]) <= 5) {
      prompts.push(m[2].replace(/\*+\s*$/, '').trim());
    }
    if (prompts.length === 5) break;
  }
  return prompts;
}

// KST 기준 날짜(YYYY-MM-DD) 문자열로 변환 — 모임 당일 판정용
function toKstDateString(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(d);
}

// GENERATED라도 파싱된 질문이 하나도 없으면 실패한 생성으로 보고 재생성 대상으로 취급
function hasUsablePrompts(discussion: {
  bookPrompts: unknown;
  moviePrompts: unknown;
}): boolean {
  const book = (discussion.bookPrompts as string[] | null) ?? [];
  const movie = (discussion.moviePrompts as string[] | null) ?? [];
  return book.length > 0 || movie.length > 0;
}

@Injectable()
export class DiscussionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly claude: ClaudeService,
  ) {}

  async generate(meetingId: string): Promise<void> {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
    });
    if (!meeting) throw new NotFoundException('모임을 찾을 수 없습니다');

    const existing = await this.prisma.discussion.findUnique({
      where: { meetingId },
    });
    if (existing?.status === 'GENERATED' && hasUsablePrompts(existing)) return;

    const discussion = await this.prisma.discussion.upsert({
      where: { meetingId },
      create: { meetingId, groupId: meeting.groupId, status: 'GENERATING' },
      update: { status: 'GENERATING' },
    });

    let bookPrompts: string[] | null = null;
    let bookContext: string | null = null;
    let moviePrompts: string[] | null = null;
    let movieContext: string | null = null;

    if (meeting.bookTitle && meeting.bookAuthor) {
      let text = '';
      for await (const chunk of this.claude.streamText(
        buildBookPrompt(meeting.bookTitle, meeting.bookAuthor),
        SYSTEM_PROMPT,
      )) {
        text += chunk;
      }
      bookContext = text;
      bookPrompts = parsePrompts(text);
    }

    if (meeting.movieTitle && meeting.movieDirector) {
      let text = '';
      for await (const chunk of this.claude.streamText(
        buildMoviePrompt(meeting.movieTitle, meeting.movieDirector),
        SYSTEM_PROMPT,
      )) {
        text += chunk;
      }
      movieContext = text;
      moviePrompts = parsePrompts(text);
    }

    await this.prisma.discussion.update({
      where: { id: discussion.id },
      data: {
        bookPrompts: bookPrompts ?? undefined,
        bookContext,
        moviePrompts: moviePrompts ?? undefined,
        movieContext,
        status: 'GENERATED',
        generatedAt: new Date(),
      },
    });
  }

  streamGenerate(meetingId: string): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      void (async () => {
        try {
          const meeting = await this.prisma.meeting.findUnique({
            where: { id: meetingId },
          });

          if (!meeting) {
            subscriber.next({
              data: JSON.stringify({ type: 'error', message: '모임을 찾을 수 없습니다' }),
            } as MessageEvent);
            subscriber.complete();
            return;
          }

          let existing = await this.prisma.discussion.findUnique({
            where: { meetingId },
          });

          // If another process is already generating, poll until done (up to 3 min)
          if (existing?.status === 'GENERATING') {
            let waited = 0;
            while (existing?.status === 'GENERATING' && waited < 180_000) {
              await new Promise((r) => setTimeout(r, 3000));
              waited += 3000;
              existing = await this.prisma.discussion.findUnique({ where: { meetingId } });
            }
          }

          if (existing?.status === 'GENERATED' && hasUsablePrompts(existing)) {
            if (existing.bookPrompts) {
              subscriber.next({ data: JSON.stringify({ type: 'section-start', section: 'BOOK' }) } as MessageEvent);
              subscriber.next({
                data: JSON.stringify({
                  type: 'section-end',
                  section: 'BOOK',
                  prompts: existing.bookPrompts as string[],
                }),
              } as MessageEvent);
            }
            if (existing.moviePrompts) {
              subscriber.next({ data: JSON.stringify({ type: 'section-start', section: 'MOVIE' }) } as MessageEvent);
              subscriber.next({
                data: JSON.stringify({
                  type: 'section-end',
                  section: 'MOVIE',
                  prompts: existing.moviePrompts as string[],
                }),
              } as MessageEvent);
            }
            subscriber.next({ data: JSON.stringify({ type: 'done' }) } as MessageEvent);
            subscriber.complete();
            return;
          }

          const discussion = await this.prisma.discussion.upsert({
            where: { meetingId },
            create: { meetingId, groupId: meeting.groupId, status: 'GENERATING' },
            update: { status: 'GENERATING' },
          });

          let bookPrompts: string[] | null = null;
          let bookContext: string | null = null;
          let moviePrompts: string[] | null = null;
          let movieContext: string | null = null;

          if (meeting.bookTitle && meeting.bookAuthor) {
            subscriber.next({ data: JSON.stringify({ type: 'section-start', section: 'BOOK' }) } as MessageEvent);
            let text = '';
            for await (const chunk of this.claude.streamText(
              buildBookPrompt(meeting.bookTitle, meeting.bookAuthor),
              SYSTEM_PROMPT,
            )) {
              text += chunk;
              subscriber.next({
                data: JSON.stringify({ type: 'chunk', section: 'BOOK', content: chunk }),
              } as MessageEvent);
            }
            bookContext = text;
            bookPrompts = parsePrompts(text);
            subscriber.next({
              data: JSON.stringify({ type: 'section-end', section: 'BOOK', prompts: bookPrompts }),
            } as MessageEvent);
          }

          if (meeting.movieTitle && meeting.movieDirector) {
            subscriber.next({ data: JSON.stringify({ type: 'section-start', section: 'MOVIE' }) } as MessageEvent);
            let text = '';
            for await (const chunk of this.claude.streamText(
              buildMoviePrompt(meeting.movieTitle, meeting.movieDirector),
              SYSTEM_PROMPT,
            )) {
              text += chunk;
              subscriber.next({
                data: JSON.stringify({ type: 'chunk', section: 'MOVIE', content: chunk }),
              } as MessageEvent);
            }
            movieContext = text;
            moviePrompts = parsePrompts(text);
            subscriber.next({
              data: JSON.stringify({ type: 'section-end', section: 'MOVIE', prompts: moviePrompts }),
            } as MessageEvent);
          }

          await this.prisma.discussion.update({
            where: { id: discussion.id },
            data: {
              bookPrompts: bookPrompts ?? undefined,
              bookContext,
              moviePrompts: moviePrompts ?? undefined,
              movieContext,
              status: 'GENERATED',
              generatedAt: new Date(),
            },
          });

          subscriber.next({ data: JSON.stringify({ type: 'done' }) } as MessageEvent);
          subscriber.complete();
        } catch (error) {
          subscriber.next({
            data: JSON.stringify({ type: 'error', message: (error as Error).message }),
          } as MessageEvent);
          subscriber.complete();
        }
      })();
    });
  }

  async findByMeetingId(meetingId: string): Promise<DiscussionDto> {
    const discussion = await this.prisma.discussion.findUnique({
      where: { meetingId },
    });
    if (!discussion) throw new NotFoundException('발제문을 찾을 수 없습니다');
    return {
      id: discussion.id,
      meetingId: discussion.meetingId,
      groupId: discussion.groupId,
      status: discussion.status as DiscussionDto['status'],
      bookPrompts: discussion.bookPrompts as string[] | null,
      moviePrompts: discussion.moviePrompts as string[] | null,
      bookContext: discussion.bookContext,
      movieContext: discussion.movieContext,
      generatedAt: discussion.generatedAt?.toISOString() ?? null,
      publishedAt: discussion.publishedAt?.toISOString() ?? null,
    };
  }

  async upsertNote(
    meetingId: string,
    userId: string,
    dto: UpsertNoteDto,
  ): Promise<DiscussionNoteDto> {
    const discussion = await this.prisma.discussion.findUnique({
      where: { meetingId },
      include: { meeting: { select: { status: true, confirmedDate: true } } },
    });
    if (!discussion) throw new NotFoundException('발제문을 찾을 수 없습니다');

    if (discussion.meeting.status === 'DONE') {
      throw new ForbiddenException('종료된 모임의 노트는 수정할 수 없어요');
    }
    if (
      !discussion.meeting.confirmedDate ||
      toKstDateString(new Date()) !==
        toKstDateString(discussion.meeting.confirmedDate)
    ) {
      throw new ForbiddenException('발제 노트는 모임 당일에만 작성할 수 있어요');
    }

    const note = await this.prisma.discussionNote.upsert({
      where: {
        discussionId_userId_promptKind_questionIndex: {
          discussionId: discussion.id,
          userId,
          promptKind: dto.promptKind as 'BOOK' | 'MOVIE',
          questionIndex: dto.questionIndex,
        },
      },
      create: {
        discussionId: discussion.id,
        userId,
        promptKind: dto.promptKind as 'BOOK' | 'MOVIE',
        questionIndex: dto.questionIndex,
        content: dto.content,
        isPublic: dto.isPublic,
        publishedAt: dto.isPublic ? new Date() : null,
      },
      update: {
        content: dto.content,
        isPublic: dto.isPublic,
        publishedAt: dto.isPublic ? new Date() : null,
      },
      include: { user: { select: { nickname: true, profileImageUrl: true } } },
    });

    return this.mapNote(note);
  }

  async listNotes(meetingId: string, userId: string): Promise<DiscussionNoteDto[]> {
    const discussion = await this.prisma.discussion.findUnique({
      where: { meetingId },
    });
    if (!discussion) throw new NotFoundException('발제문을 찾을 수 없습니다');

    const notes = await this.prisma.discussionNote.findMany({
      where: {
        discussionId: discussion.id,
        OR: [{ userId }, { isPublic: true }],
      },
      include: { user: { select: { nickname: true, profileImageUrl: true } } },
      orderBy: [{ promptKind: 'asc' }, { questionIndex: 'asc' }, { createdAt: 'asc' }],
    });

    return notes.map((n) => this.mapNote(n));
  }

  async listCustomPrompts(meetingId: string): Promise<DiscussionCustomPromptDto[]> {
    const discussion = await this.prisma.discussion.findUnique({
      where: { meetingId },
      select: { id: true },
    });
    if (!discussion) throw new NotFoundException('발제문을 찾을 수 없습니다');

    const prompts = await this.prisma.discussionCustomPrompt.findMany({
      where: { discussionId: discussion.id },
      include: { user: { select: { nickname: true } } },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    return prompts.map((p) => this.mapCustomPrompt(p));
  }

  async addCustomPrompt(
    meetingId: string,
    userId: string,
    dto: CreateCustomPromptDto,
  ): Promise<DiscussionCustomPromptDto> {
    const discussion = await this.prisma.discussion.findUnique({
      where: { meetingId },
      include: {
        meeting: { select: { status: true, bookTitle: true, movieTitle: true } },
      },
    });
    if (!discussion) throw new NotFoundException('발제문을 찾을 수 없습니다');
    if (discussion.meeting.status === 'DONE') {
      throw new ForbiddenException('종료된 모임에는 발제를 추가할 수 없어요');
    }
    const hasWork =
      dto.promptKind === 'BOOK'
        ? !!discussion.meeting.bookTitle
        : !!discussion.meeting.movieTitle;
    if (!hasWork) {
      throw new BadRequestException('이 모임에서 다루지 않는 작품이에요');
    }

    const created = await this.prisma.discussionCustomPrompt.create({
      data: {
        discussionId: discussion.id,
        userId,
        promptKind: dto.promptKind as 'BOOK' | 'MOVIE',
        content: dto.content.trim(),
      },
      include: { user: { select: { nickname: true } } },
    });
    return this.mapCustomPrompt(created);
  }

  private mapCustomPrompt(p: {
    id: string;
    promptKind: 'BOOK' | 'MOVIE';
    content: string;
    userId: string;
    createdAt: Date;
    user: { nickname: string };
  }): DiscussionCustomPromptDto {
    return {
      id: p.id,
      promptKind: p.promptKind,
      content: p.content,
      authorId: p.userId,
      authorNickname: p.user.nickname,
      createdAt: p.createdAt.toISOString(),
    };
  }

  private mapNote(note: {
    id: string;
    discussionId: string;
    userId: string;
    promptKind: string;
    questionIndex: number;
    content: string;
    isPublic: boolean;
    publishedAt: Date | null;
    createdAt: Date;
    user: { nickname: string; profileImageUrl: string | null };
  }): DiscussionNoteDto {
    return {
      id: note.id,
      discussionId: note.discussionId,
      userId: note.userId,
      promptKind: note.promptKind as DiscussionNoteDto['promptKind'],
      questionIndex: note.questionIndex,
      content: note.content,
      isPublic: note.isPublic,
      publishedAt: note.publishedAt?.toISOString() ?? null,
      createdAt: note.createdAt.toISOString(),
      author: {
        nickname: note.user.nickname,
        profileImageUrl: note.user.profileImageUrl,
      },
    };
  }
}
