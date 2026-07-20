import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { MeetingStatus, Prisma, PromptKind } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GroupService } from '../group/group.service';
import {
  CreateManualLibraryEntryDto,
  LibraryItemResponseDto,
  LibraryResponseDto,
  UpdateManualLibraryEntryDto,
  UpsertLibraryReviewDto,
} from './dto/library.dto';

type MeetingWithGroup = Prisma.MeetingGetPayload<{
  include: {
    group: { select: { id: true; name: true } };
    discussion: { select: { bookPrompts: true; moviePrompts: true } };
  };
}>;

type ManualEntry = Prisma.ManualLibraryEntryGetPayload<object>;

const MEETING_INCLUDE = {
  group: { select: { id: true, name: true } },
  discussion: { select: { bookPrompts: true, moviePrompts: true } },
} as const;

interface ReviewInfo {
  rating: number;
  comment: string | null;
  updatedAt: Date;
  updatedByNickname: string | null;
}

@Injectable()
export class LibraryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
  ) {}

  async getMine(userId: string): Promise<LibraryResponseDto> {
    const availabilities = await this.prisma.meetingAvailability.findMany({
      where: { userId, meeting: { status: MeetingStatus.DONE } },
      include: {
        meeting: { include: MEETING_INCLUDE },
      },
    });
    const meetings = availabilities.map((a) => a.meeting);

    const reviews = await this.prisma.personalLibraryReview.findMany({
      where: { userId, meetingId: { in: meetings.map((m) => m.id) } },
    });
    const reviewMap = new Map<string, ReviewInfo>(
      reviews.map((r) => [
        this.reviewKey(r.meetingId, r.kind),
        {
          rating: r.rating,
          comment: r.comment,
          updatedAt: r.updatedAt,
          updatedByNickname: null,
        },
      ]),
    );

    const manualEntries = await this.prisma.manualLibraryEntry.findMany({
      where: { userId },
    });

    return this.buildLibrary(meetings, reviewMap, manualEntries);
  }

  async createManualEntry(
    userId: string,
    dto: CreateManualLibraryEntryDto,
  ): Promise<LibraryItemResponseDto> {
    const entry = await this.prisma.manualLibraryEntry.create({
      data: {
        userId,
        kind: dto.kind,
        title: dto.title.trim(),
        creator: dto.creator?.trim() || null,
        finishedAt: dto.finishedAt ? new Date(dto.finishedAt) : null,
        discussionText: dto.discussionText?.trim() || null,
      },
    });
    return this.manualToItem(entry);
  }

  async updateManualEntry(
    userId: string,
    entryId: string,
    dto: UpdateManualLibraryEntryDto,
  ): Promise<LibraryItemResponseDto> {
    const existing = await this.prisma.manualLibraryEntry.findUnique({
      where: { id: entryId },
      select: { userId: true },
    });
    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('수기 항목을 찾을 수 없습니다');
    }
    const entry = await this.prisma.manualLibraryEntry.update({
      where: { id: entryId },
      data: {
        title: dto.title?.trim(),
        creator: dto.creator === undefined ? undefined : dto.creator?.trim() || null,
        finishedAt:
          dto.finishedAt === undefined
            ? undefined
            : dto.finishedAt
              ? new Date(dto.finishedAt)
              : null,
        discussionText:
          dto.discussionText === undefined
            ? undefined
            : dto.discussionText?.trim() || null,
        rating: dto.rating === undefined ? undefined : dto.rating,
        comment:
          dto.comment === undefined ? undefined : dto.comment?.trim() || null,
      },
    });
    return this.manualToItem(entry);
  }

  async deleteManualEntry(userId: string, entryId: string): Promise<void> {
    await this.prisma.manualLibraryEntry.deleteMany({
      where: { id: entryId, userId },
    });
  }

  async getShareStatus(userId: string): Promise<{ shareId: string | null }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { libraryShareId: true },
    });
    return { shareId: user?.libraryShareId ?? null };
  }

  async enableShare(userId: string): Promise<{ shareId: string }> {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { libraryShareId: true },
    });
    if (existing?.libraryShareId) return { shareId: existing.libraryShareId };

    const shareId = randomUUID();
    await this.prisma.user.update({
      where: { id: userId },
      data: { libraryShareId: shareId },
    });
    return { shareId };
  }

  async disableShare(userId: string): Promise<{ shareId: null }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { libraryShareId: null },
    });
    return { shareId: null };
  }

  async getBySharedId(
    shareId: string,
  ): Promise<{ ownerNickname: string; library: LibraryResponseDto }> {
    const owner = await this.prisma.user.findUnique({
      where: { libraryShareId: shareId },
      select: { id: true, nickname: true },
    });
    if (!owner) {
      throw new NotFoundException('공유된 라이브러리를 찾을 수 없어요');
    }
    const library = await this.getMine(owner.id);
    return { ownerNickname: owner.nickname, library };
  }

  async getForGroup(groupId: string, userId: string): Promise<LibraryResponseDto> {
    await this.groupService.assertMember(groupId, userId);

    const meetings = await this.prisma.meeting.findMany({
      where: { groupId, status: MeetingStatus.DONE },
      include: MEETING_INCLUDE,
    });

    const reviews = await this.prisma.groupLibraryReview.findMany({
      where: { meetingId: { in: meetings.map((m) => m.id) } },
      include: { updatedBy: { select: { nickname: true } } },
    });
    const reviewMap = new Map<string, ReviewInfo>(
      reviews.map((r) => [
        this.reviewKey(r.meetingId, r.kind),
        {
          rating: r.rating,
          comment: r.comment,
          updatedAt: r.updatedAt,
          updatedByNickname: r.updatedBy.nickname,
        },
      ]),
    );

    return this.buildLibrary(meetings, reviewMap);
  }

  async upsertPersonalReview(
    userId: string,
    meetingId: string,
    kind: PromptKind,
    dto: UpsertLibraryReviewDto,
  ): Promise<LibraryItemResponseDto> {
    const meeting = await this.loadParticipatedMeeting(userId, meetingId, kind);

    const review = await this.prisma.personalLibraryReview.upsert({
      where: { userId_meetingId_kind: { userId, meetingId, kind } },
      update: { rating: dto.rating, comment: dto.comment ?? null },
      create: {
        userId,
        meetingId,
        kind,
        rating: dto.rating,
        comment: dto.comment ?? null,
      },
    });

    return this.toItem(meeting, kind, {
      rating: review.rating,
      comment: review.comment,
      updatedAt: review.updatedAt,
      updatedByNickname: null,
    });
  }

  async deletePersonalReview(
    userId: string,
    meetingId: string,
    kind: PromptKind,
  ): Promise<void> {
    await this.prisma.personalLibraryReview.deleteMany({
      where: { userId, meetingId, kind },
    });
  }

  async upsertGroupReview(
    groupId: string,
    meetingId: string,
    kind: PromptKind,
    userId: string,
    dto: UpsertLibraryReviewDto,
  ): Promise<LibraryItemResponseDto> {
    await this.groupService.assertMember(groupId, userId);
    const meeting = await this.loadGroupMeeting(groupId, meetingId, kind);

    const review = await this.prisma.groupLibraryReview.upsert({
      where: { meetingId_kind: { meetingId, kind } },
      update: { rating: dto.rating, comment: dto.comment ?? null, updatedById: userId },
      create: {
        meetingId,
        kind,
        rating: dto.rating,
        comment: dto.comment ?? null,
        updatedById: userId,
      },
      include: { updatedBy: { select: { nickname: true } } },
    });

    return this.toItem(meeting, kind, {
      rating: review.rating,
      comment: review.comment,
      updatedAt: review.updatedAt,
      updatedByNickname: review.updatedBy.nickname,
    });
  }

  async deleteGroupReview(
    groupId: string,
    meetingId: string,
    kind: PromptKind,
    userId: string,
  ): Promise<void> {
    await this.groupService.assertMember(groupId, userId);
    await this.prisma.groupLibraryReview.deleteMany({
      where: { meetingId, kind, meeting: { groupId } },
    });
  }

  private async loadParticipatedMeeting(
    userId: string,
    meetingId: string,
    kind: PromptKind,
  ): Promise<MeetingWithGroup> {
    const availability = await this.prisma.meetingAvailability.findUnique({
      where: { meetingId_userId: { meetingId, userId } },
      include: {
        meeting: { include: MEETING_INCLUDE },
      },
    });
    if (!availability) {
      throw new NotFoundException('참여하지 않은 모임이에요');
    }
    this.assertDoneAndHasKind(availability.meeting, kind);
    return availability.meeting;
  }

  private async loadGroupMeeting(
    groupId: string,
    meetingId: string,
    kind: PromptKind,
  ): Promise<MeetingWithGroup> {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: MEETING_INCLUDE,
    });
    if (!meeting || meeting.groupId !== groupId) {
      throw new NotFoundException('모임을 찾을 수 없습니다');
    }
    this.assertDoneAndHasKind(meeting, kind);
    return meeting;
  }

  private assertDoneAndHasKind(meeting: MeetingWithGroup, kind: PromptKind): void {
    if (meeting.status !== MeetingStatus.DONE) {
      throw new BadRequestException('종료된 모임만 리뷰를 남길 수 있어요');
    }
    const hasKind = kind === PromptKind.BOOK ? !!meeting.bookTitle : !!meeting.movieTitle;
    if (!hasKind) {
      throw new BadRequestException(
        kind === PromptKind.BOOK ? '이 모임엔 책이 없어요' : '이 모임엔 영화가 없어요',
      );
    }
  }

  private buildLibrary(
    meetings: MeetingWithGroup[],
    reviewMap: Map<string, ReviewInfo>,
    manualEntries: ManualEntry[] = [],
  ): LibraryResponseDto {
    const books: LibraryItemResponseDto[] = [];
    const movies: LibraryItemResponseDto[] = [];

    for (const entry of manualEntries) {
      const item = this.manualToItem(entry);
      if (entry.kind === PromptKind.BOOK) books.push(item);
      else movies.push(item);
    }

    for (const meeting of meetings) {
      if (meeting.bookTitle) {
        books.push(
          this.toItem(meeting, PromptKind.BOOK, reviewMap.get(this.reviewKey(meeting.id, PromptKind.BOOK)) ?? null),
        );
      }
      if (meeting.movieTitle) {
        movies.push(
          this.toItem(meeting, PromptKind.MOVIE, reviewMap.get(this.reviewKey(meeting.id, PromptKind.MOVIE)) ?? null),
        );
      }
    }

    const byRecency = (a: LibraryItemResponseDto, b: LibraryItemResponseDto) => {
      const aTime = a.finishedAt?.getTime() ?? 0;
      const bTime = b.finishedAt?.getTime() ?? 0;
      return bTime - aTime;
    };

    return { books: books.sort(byRecency), movies: movies.sort(byRecency) };
  }

  private toItem(
    meeting: MeetingWithGroup,
    kind: PromptKind,
    review: ReviewInfo | null,
  ): LibraryItemResponseDto {
    const rawPrompts =
      kind === PromptKind.BOOK
        ? meeting.discussion?.bookPrompts
        : meeting.discussion?.moviePrompts;
    const prompts = Array.isArray(rawPrompts) ? (rawPrompts as string[]) : null;

    return {
      meetingId: meeting.id,
      source: 'MEETING',
      groupId: meeting.group.id,
      groupName: meeting.group.name,
      kind,
      title: (kind === PromptKind.BOOK ? meeting.bookTitle : meeting.movieTitle) as string,
      creator: kind === PromptKind.BOOK ? meeting.bookAuthor : meeting.movieDirector,
      finishedAt: meeting.confirmedDate,
      review: review
        ? {
            rating: review.rating,
            comment: review.comment,
            updatedAt: review.updatedAt,
            updatedByNickname: review.updatedByNickname,
          }
        : null,
      discussionPrompts: prompts && prompts.length > 0 ? prompts : null,
      discussionText: null,
    };
  }

  private manualToItem(entry: ManualEntry): LibraryItemResponseDto {
    return {
      meetingId: entry.id,
      source: 'MANUAL',
      groupId: null,
      groupName: null,
      kind: entry.kind,
      title: entry.title,
      creator: entry.creator,
      finishedAt: entry.finishedAt,
      review:
        entry.rating != null
          ? {
              rating: entry.rating,
              comment: entry.comment,
              updatedAt: entry.updatedAt,
              updatedByNickname: null,
            }
          : null,
      discussionPrompts: null,
      discussionText: entry.discussionText,
    };
  }

  private reviewKey(meetingId: string, kind: PromptKind): string {
    return `${meetingId}:${kind}`;
  }
}
