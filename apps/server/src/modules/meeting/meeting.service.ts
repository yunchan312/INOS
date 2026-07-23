import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { MeetingStatus, Prisma } from '@prisma/client';
import axios from 'axios';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { GroupService } from '../group/group.service';
import { MailService } from '../mail/mail.service';
import { NotificationService } from '../notification/notification.service';
import { formatDateLabel, meetingWorkLabel } from '../notification/notification.util';
import {
  CreateMeetingDto,
  MeetingResponseDto,
  SubmitAvailabilityDto,
  SubmitAvailabilityResponseDto,
  UpdateMeetingDto,
} from './dto/meeting.dto';

export const MEETING_INVITE_QUEUE = 'meeting-invite';
export const DISCUSSION_GENERATION_QUEUE = 'discussion-generation';

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_RANGE_DAYS = 2;
const MAX_RANGE_DAYS = 30;

interface MeetingWithAvailability {
  meeting: Prisma.MeetingGetPayload<{
    include: {
      discussion: { select: { id: true; status: true } };
      availabilities: {
        select: {
          userId: true;
          availableDates: true;
          timeNote: true;
          user: { select: { nickname: true } };
        };
      };
    };
  }>;
  members: { userId: string; nickname: string }[];
}

@Injectable()
export class MeetingService {
  private readonly logger = new Logger(MeetingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly groupService: GroupService,
    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
    private readonly config: ConfigService,
    @InjectQueue(MEETING_INVITE_QUEUE)
    private readonly meetingInviteQueue: Queue,
    @InjectQueue(DISCUSSION_GENERATION_QUEUE)
    private readonly discussionQueue: Queue,
  ) {}

  async create(
    groupId: string,
    ownerUserId: string,
    dto: CreateMeetingDto,
  ): Promise<MeetingResponseDto> {
    this.validateContent(dto);
    const { from, to } = this.parseAndValidateRange(dto.candidateFrom, dto.candidateTo);

    const meeting = await this.prisma.meeting.create({
      data: {
        groupId,
        createdById: ownerUserId,
        bookTitle: dto.bookTitle ?? null,
        bookAuthor: dto.bookAuthor ?? null,
        movieTitle: dto.movieTitle ?? null,
        movieDirector: dto.movieDirector ?? null,
        candidateFrom: from,
        candidateTo: to,
        location: dto.location ?? null,
        status: MeetingStatus.PENDING,
      },
    });

    const members = await this.prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });

    for (const m of members) {
      await this.meetingInviteQueue.add(
        'send',
        { meetingId: meeting.id, memberUserId: m.userId },
        { removeOnComplete: true, removeOnFail: 100, attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
      );
    }

    // 생성 48시간 후에도 응답하지 않은 멤버에게 리마인더 발송
    await this.notificationService.scheduleAvailabilityReminder(meeting.id);

    this.notifyOrgEvent(groupId, 'meeting-created');

    return this.load(groupId, meeting.id, ownerUserId);
  }

  async list(groupId: string, userId: string): Promise<MeetingResponseDto[]> {
    await this.groupService.assertMember(groupId, userId);
    const members = await this.loadMembers(groupId);

    const meetings = await this.prisma.meeting.findMany({
      where: { groupId },
      orderBy: [{ confirmedDate: 'desc' }, { createdAt: 'desc' }],
      include: {
        discussion: { select: { id: true, status: true } },
        availabilities: {
          select: {
            userId: true,
            availableDates: true,
            timeNote: true,
            user: { select: { nickname: true } },
          },
        },
      },
    });

    return meetings.map((m) => this.toDto({ meeting: m, members }, userId));
  }

  private async loadMembers(
    groupId: string,
  ): Promise<{ userId: string; nickname: string }[]> {
    const members = await this.prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true, user: { select: { nickname: true } } },
    });
    return members.map((m) => ({ userId: m.userId, nickname: m.user.nickname }));
  }

  async findOne(
    groupId: string,
    meetingId: string,
    userId: string,
  ): Promise<MeetingResponseDto> {
    await this.groupService.assertMember(groupId, userId);
    return this.load(groupId, meetingId, userId);
  }

  async update(
    groupId: string,
    meetingId: string,
    dto: UpdateMeetingDto,
    callerId: string,
  ): Promise<MeetingResponseDto> {
    const meeting = await this.prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting || meeting.groupId !== groupId) {
      throw new NotFoundException('모임을 찾을 수 없습니다');
    }

    const confirmedDate = dto.confirmedDate
      ? this.parseDateOnly(dto.confirmedDate)
      : meeting.confirmedDate;

    // 조율 중(PENDING) 확정은 후보 기간 안에서만.
    // 이미 확정된 모임의 일정 변경은 소유자가 자유롭게.
    if (
      dto.confirmedDate &&
      confirmedDate &&
      meeting.status === MeetingStatus.PENDING
    ) {
      const from = meeting.candidateFrom;
      const to = meeting.candidateTo;
      if (confirmedDate < from || confirmedDate > to) {
        throw new BadRequestException(
          '확정 날짜는 후보 기간 안에 있어야 합니다',
        );
      }
    }

    await this.prisma.meeting.update({
      where: { id: meetingId },
      data: {
        bookTitle: dto.bookTitle ?? meeting.bookTitle,
        bookAuthor: dto.bookAuthor ?? meeting.bookAuthor,
        movieTitle: dto.movieTitle ?? meeting.movieTitle,
        movieDirector: dto.movieDirector ?? meeting.movieDirector,
        location: dto.location ?? meeting.location,
        confirmedDate,
        status:
          confirmedDate && meeting.status === MeetingStatus.PENDING
            ? MeetingStatus.CONFIRMED
            : meeting.status,
      },
    });

    // 소유자 수동 확정(PENDING → CONFIRMED) 시에도 발제문 생성 시작
    if (confirmedDate && meeting.status === MeetingStatus.PENDING) {
      await this.enqueueDiscussionGeneration(meetingId);
      this.notifyOrgEvent(groupId, 'meeting-confirmed');
      const workLabel = meetingWorkLabel({
        bookTitle: dto.bookTitle ?? meeting.bookTitle,
        movieTitle: dto.movieTitle ?? meeting.movieTitle,
      });
      this.notifyDateConfirmed(groupId, meetingId, confirmedDate, workLabel).catch(
        (error: Error) => this.logger.warn(`날짜 확정 알림 실패: ${error.message}`),
      );
    } else if (confirmedDate) {
      // 이미 확정된 모임의 날짜 재조정 — 리마인더만 새 시각으로 재예약(확정 안내는 최초 1회만)
      this.notifyOrgEvent(groupId, 'meeting-updated');
      this.notificationService
        .scheduleMeetingReminder(meetingId, confirmedDate)
        .catch((error: Error) => this.logger.warn(`리마인더 재예약 실패: ${error.message}`));
    } else {
      this.notifyOrgEvent(groupId, 'meeting-updated');
    }

    return this.load(groupId, meetingId, callerId);
  }

  async submitAvailability(
    groupId: string,
    meetingId: string,
    userId: string,
    dto: SubmitAvailabilityDto,
  ): Promise<SubmitAvailabilityResponseDto> {
    await this.groupService.assertMember(groupId, userId);

    const meeting = await this.prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting || meeting.groupId !== groupId) {
      throw new NotFoundException('모임을 찾을 수 없습니다');
    }
    if (meeting.status !== MeetingStatus.PENDING) {
      throw new BadRequestException('이미 확정된 모임이에요');
    }

    const from = meeting.candidateFrom;
    const to = meeting.candidateTo;
    const filtered = Array.from(new Set(dto.availableDates))
      .map((iso) => this.parseDateOnly(iso))
      .filter((d) => d >= from && d <= to)
      .map((d) => d.toISOString().slice(0, 10));

    if (filtered.length === 0) {
      throw new BadRequestException('후보 기간 안의 유효한 날짜가 없어요');
    }

    const timeNote = dto.timeNote?.trim().slice(0, 80) || null;
    await this.prisma.meetingAvailability.upsert({
      where: { meetingId_userId: { meetingId, userId } },
      update: { availableDates: filtered, timeNote, respondedAt: new Date() },
      create: { meetingId, userId, availableDates: filtered, timeNote },
    });

    const memberCount = await this.prisma.groupMember.count({ where: { groupId } });
    const availabilities = await this.prisma.meetingAvailability.findMany({
      where: { meetingId },
      select: { availableDates: true },
    });

    if (availabilities.length < memberCount) {
      // 응답 수(N/M) 실시간 갱신
      this.notifyOrgEvent(groupId, 'availability-updated');
      return {
        confirmed: false,
        confirmedDate: null,
        respondedCount: availabilities.length,
        totalMembers: memberCount,
      };
    }

    const allDates = availabilities.map(
      (a) => a.availableDates as string[],
    );
    const confirmedIso = this.computeConfirmedDate(allDates, from, to);
    if (!confirmedIso) {
      // 전원 응답했지만 모두 가능한 날짜가 없음 → 소유자에게 수동 확정 요청
      this.notifyOwnerNoCommonDate(meeting.groupId, meeting.id).catch(
        (error: Error) =>
          this.logger.warn(`수동 확정 안내 메일 실패: ${error.message}`),
      );
      this.notifyOrgEvent(groupId, 'availability-updated');
      return {
        confirmed: false,
        confirmedDate: null,
        respondedCount: availabilities.length,
        totalMembers: memberCount,
      };
    }

    const confirmedDate = this.parseDateOnly(confirmedIso);
    await this.prisma.meeting.update({
      where: { id: meetingId },
      data: {
        confirmedDate,
        status: MeetingStatus.CONFIRMED,
      },
    });

    await this.enqueueDiscussionGeneration(meetingId);
    this.notifyOrgEvent(groupId, 'meeting-confirmed');
    const workLabel = meetingWorkLabel(meeting);
    this.notifyDateConfirmed(groupId, meetingId, confirmedDate, workLabel).catch(
      (error: Error) => this.logger.warn(`날짜 확정 알림 실패: ${error.message}`),
    );

    return {
      confirmed: true,
      confirmedDate,
      respondedCount: availabilities.length,
      totalMembers: memberCount,
    };
  }

  // 날짜 확정 알림 메일(전원) + 3시간 전 리마인더 예약 + 응답 독촉 리마인더 취소
  private async notifyDateConfirmed(
    groupId: string,
    meetingId: string,
    confirmedDate: Date,
    workLabel: string,
  ): Promise<void> {
    const [group, members] = await Promise.all([
      this.prisma.group.findUnique({ where: { id: groupId }, select: { name: true } }),
      this.loadMembersWithContact(groupId),
    ]);
    if (!group) return;

    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    const meetingUrl = `${frontendUrl}/orgs/${groupId}/meetings/${meetingId}`;
    const dateLabel = formatDateLabel(confirmedDate);

    for (const m of members) {
      await this.notificationService.sendOnce(meetingId, m.id, 'DATE_CONFIRMED', () =>
        this.mailService.sendDateConfirmed({
          toEmail: m.email,
          toName: m.nickname,
          groupName: group.name,
          workLabel,
          dateLabel,
          meetingUrl,
        }),
      );
    }

    await this.notificationService.cancelAvailabilityReminder(meetingId);
    await this.notificationService.scheduleMeetingReminder(meetingId, confirmedDate);
  }

  private async loadMembersWithContact(
    groupId: string,
  ): Promise<{ id: string; email: string; nickname: string }[]> {
    const members = await this.prisma.groupMember.findMany({
      where: { groupId },
      select: { user: { select: { id: true, email: true, nickname: true } } },
    });
    return members.map((m) => m.user);
  }

  // 날짜 확정 즉시 발제문 생성 시작
  private async enqueueDiscussionGeneration(meetingId: string): Promise<void> {
    await this.discussionQueue.add(
      'generate',
      { meetingId },
      {
        removeOnComplete: true,
        removeOnFail: 100,
        attempts: 3,
        backoff: { type: 'exponential', delay: 60000 },
      },
    );
  }

  // 오가니제이션 홈 실시간 갱신용 — ai-server socket 허브로 릴레이 (fire-and-forget)
  private notifyOrgEvent(groupId: string, type: string): void {
    const aiUrl = this.config.get<string>('AI_SERVER_URL', 'http://localhost:3001');
    axios
      .post(`${aiUrl}/ai/events/orgs/${groupId}`, { type })
      .catch((error: Error) => {
        this.logger.warn(`오가니제이션 이벤트 전송 실패(${type}): ${error.message}`);
      });
  }

  private async notifyOwnerNoCommonDate(
    groupId: string,
    meetingId: string,
  ): Promise<void> {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { owner: { select: { email: true, nickname: true } } },
    });
    if (!group) return;
    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    await this.mailService.sendNoCommonDate({
      toEmail: group.owner.email,
      toName: group.owner.nickname,
      groupName: group.name,
      orgUrl: `${frontendUrl}/orgs/${groupId}`,
      meetingId,
    });
  }

  async finish(
    groupId: string,
    meetingId: string,
    userId: string,
  ): Promise<MeetingResponseDto> {
    await this.groupService.assertMember(groupId, userId);
    const meeting = await this.prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting || meeting.groupId !== groupId) {
      throw new NotFoundException('모임을 찾을 수 없습니다');
    }
    if (meeting.status === MeetingStatus.DONE) {
      throw new BadRequestException('이미 종료된 모임이에요');
    }
    await this.prisma.meeting.update({
      where: { id: meetingId },
      data: { status: MeetingStatus.DONE },
    });

    // 접속 중인 다른 멤버들의 UI를 실시간 전환 (실패해도 종료 처리는 유지)
    const aiUrl = this.config.get<string>('AI_SERVER_URL', 'http://localhost:3001');
    axios
      .post(`${aiUrl}/ai/discussions/${meetingId}/events/finished`)
      .catch((error: Error) => {
        this.logger.warn(`모임 종료 브로드캐스트 실패: ${error.message}`);
      });
    this.notifyOrgEvent(groupId, 'meeting-finished');
    // 조기 종료된 모임에 예약된 3시간 전 리마인더는 취소
    this.notificationService
      .cancelMeetingReminder(meetingId)
      .catch((error: Error) => this.logger.warn(`리마인더 취소 실패: ${error.message}`));

    return this.load(groupId, meetingId, userId);
  }

  async remove(groupId: string, meetingId: string): Promise<void> {
    const meeting = await this.prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting || meeting.groupId !== groupId) {
      throw new NotFoundException('모임을 찾을 수 없습니다');
    }
    await this.prisma.meeting.delete({ where: { id: meetingId } });
    this.notifyOrgEvent(groupId, 'meeting-deleted');
    await Promise.all([
      this.notificationService.cancelMeetingReminder(meetingId),
      this.notificationService.cancelAvailabilityReminder(meetingId),
    ]).catch((error: Error) =>
      this.logger.warn(`예약된 알림 취소 실패: ${error.message}`),
    );
  }

  async findMemberEmail(
    meetingId: string,
    memberUserId: string,
  ): Promise<{ user: { email: string; nickname: string }; meeting: Prisma.MeetingGetPayload<{ include: { group: true } }> } | null> {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { group: true },
    });
    if (!meeting) return null;
    const user = await this.prisma.user.findUnique({
      where: { id: memberUserId },
      select: { email: true, nickname: true },
    });
    if (!user) return null;
    return { user, meeting };
  }

  private async load(
    groupId: string,
    meetingId: string,
    userId: string,
  ): Promise<MeetingResponseDto> {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        discussion: { select: { id: true, status: true } },
        availabilities: {
          select: {
            userId: true,
            availableDates: true,
            timeNote: true,
            user: { select: { nickname: true } },
          },
        },
      },
    });
    if (!meeting || meeting.groupId !== groupId) {
      throw new NotFoundException('모임을 찾을 수 없습니다');
    }
    const members = await this.loadMembers(groupId);
    return this.toDto({ meeting, members }, userId);
  }

  private toDto(
    { meeting, members }: MeetingWithAvailability,
    userId: string,
  ): MeetingResponseDto {
    const memberCount = members.length;
    const mine = meeting.availabilities.find((a) => a.userId === userId);
    const isPending = meeting.status === MeetingStatus.PENDING;
    const respondedIds = new Set(meeting.availabilities.map((a) => a.userId));
    return {
      id: meeting.id,
      groupId: meeting.groupId,
      createdById: meeting.createdById,
      bookTitle: meeting.bookTitle,
      bookAuthor: meeting.bookAuthor,
      movieTitle: meeting.movieTitle,
      movieDirector: meeting.movieDirector,
      candidateFrom: meeting.candidateFrom,
      candidateTo: meeting.candidateTo,
      confirmedDate: meeting.confirmedDate,
      location: meeting.location,
      status: meeting.status,
      createdAt: meeting.createdAt,
      respondedCount: meeting.availabilities.length,
      totalMembers: memberCount,
      discussionId: meeting.discussion?.id ?? null,
      discussionStatus: meeting.discussion?.status ?? null,
      myAvailability: (mine?.availableDates as string[] | undefined) ?? null,
      myTimeNote: mine?.timeNote ?? null,
      dateCounts:
        isPending && meeting.availabilities.length > 0
          ? Object.fromEntries(
              this.countDates(
                meeting.availabilities.map((a) => a.availableDates as string[]),
                meeting.candidateFrom,
                meeting.candidateTo,
              ),
            )
          : null,
      responses: isPending
        ? meeting.availabilities.map((a) => ({
            userId: a.userId,
            nickname: a.user.nickname,
            availableDates: (a.availableDates as string[]) ?? [],
            timeNote: a.timeNote ?? null,
          }))
        : null,
      nonResponders: isPending
        ? members.filter((m) => !respondedIds.has(m.userId))
        : null,
    };
  }

  private validateContent(dto: CreateMeetingDto): void {
    const hasBookTitle = !!dto.bookTitle?.trim();
    const hasBookAuthor = !!dto.bookAuthor?.trim();
    const hasMovieTitle = !!dto.movieTitle?.trim();
    const hasMovieDirector = !!dto.movieDirector?.trim();

    if (hasBookTitle !== hasBookAuthor) {
      throw new BadRequestException('책 제목과 저자는 함께 입력해야 해요');
    }
    if (hasMovieTitle !== hasMovieDirector) {
      throw new BadRequestException('영화 제목과 감독은 함께 입력해야 해요');
    }
    if (!hasBookTitle && !hasMovieTitle) {
      throw new BadRequestException('책 또는 영화 중 하나는 필수예요');
    }
  }

  private parseAndValidateRange(
    fromIso: string,
    toIso: string,
  ): { from: Date; to: Date } {
    const from = this.parseDateOnly(fromIso);
    const to = this.parseDateOnly(toIso);
    if (from >= to) {
      throw new BadRequestException('후보 종료일은 시작일보다 뒤여야 해요');
    }
    const days = Math.round((to.getTime() - from.getTime()) / DAY_MS);
    if (days < MIN_RANGE_DAYS) {
      throw new BadRequestException(`후보 기간은 최소 ${MIN_RANGE_DAYS + 1}일이어야 해요`);
    }
    if (days > MAX_RANGE_DAYS) {
      throw new BadRequestException(`후보 기간은 최대 ${MAX_RANGE_DAYS}일까지 가능해요`);
    }
    return { from, to };
  }

  private parseDateOnly(iso: string): Date {
    const trimmed = iso.slice(0, 10);
    return new Date(`${trimmed}T00:00:00.000Z`);
  }

  private countDates(
    availabilities: string[][],
    from: Date,
    to: Date,
  ): Map<string, number> {
    const counts = new Map<string, number>();
    for (const dates of availabilities) {
      const uniqueForUser = new Set(dates);
      for (const iso of uniqueForUser) {
        const trimmed = iso.slice(0, 10);
        const d = this.parseDateOnly(trimmed);
        if (d < from || d > to) continue;
        counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
      }
    }
    return counts;
  }

  // 전원 가능한 날짜만 자동 확정 (동률이면 가장 빠른 날). 없으면 null → 소유자가 수동 확정.
  private computeConfirmedDate(
    availabilities: string[][],
    from: Date,
    to: Date,
  ): string | null {
    const counts = this.countDates(availabilities, from, to);
    const unanimous = Array.from(counts.entries())
      .filter(([, c]) => c >= availabilities.length)
      .map(([d]) => d)
      .sort();
    return unanimous[0] ?? null;
  }

}
