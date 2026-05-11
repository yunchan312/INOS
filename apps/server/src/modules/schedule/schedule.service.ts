import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { GroupContentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateMeetingDto,
  UpdateMeetingDto,
  AvailabilityDto,
  MeetingResponseDto,
} from './dto/schedule.dto';

const MIN_DELAY_MS = 5_000;

@Injectable()
export class ScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('discussion-generation') private readonly discussionQueue: Queue,
  ) {}

  async create(groupId: string, dto: CreateMeetingDto): Promise<MeetingResponseDto> {
    return this.prisma.meeting.create({
      data: {
        groupId,
        groupContentId: dto.groupContentId,
        confirmedDate: dto.confirmedDate ? new Date(dto.confirmedDate) : null,
        location: dto.location,
        status: 'PENDING',
      },
      select: this.meetingSelect(),
    });
  }

  async findByGroup(groupId: string): Promise<MeetingResponseDto[]> {
    return this.prisma.meeting.findMany({
      where: { groupId },
      orderBy: { createdAt: 'asc' },
      select: this.meetingSelect(),
    });
  }

  async update(meetingId: string, dto: UpdateMeetingDto): Promise<MeetingResponseDto> {
    const meeting = await this.prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) throw new NotFoundException('모임을 찾을 수 없습니다');

    return this.prisma.meeting.update({
      where: { id: meetingId },
      data: {
        ...(dto.confirmedDate !== undefined && { confirmedDate: new Date(dto.confirmedDate) }),
        ...(dto.location !== undefined && { location: dto.location }),
      },
      select: this.meetingSelect(),
    });
  }

  async remove(meetingId: string): Promise<void> {
    const meeting = await this.prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) throw new NotFoundException('모임을 찾을 수 없습니다');
    await this.prisma.meeting.delete({ where: { id: meetingId } });
  }

  async addAvailability(
    meetingId: string,
    userId: string,
    dto: AvailabilityDto,
  ): Promise<void> {
    const meeting = await this.prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) throw new NotFoundException('모임을 찾을 수 없습니다');

    await this.prisma.meetingAvailability.upsert({
      where: { meetingId_userId: { meetingId, userId } },
      update: { availableDates: dto.availableDates },
      create: { meetingId, userId, availableDates: dto.availableDates },
    });
  }

  async confirmMeeting(meetingId: string): Promise<MeetingResponseDto> {
    const meeting = await this.prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) throw new NotFoundException('모임을 찾을 수 없습니다');

    const memberCount = await this.prisma.groupMember.count({
      where: { groupId: meeting.groupId },
    });
    const likeCount = await this.prisma.contentVote.count({
      where: { groupContentId: meeting.groupContentId, liked: true },
    });
    if (likeCount < Math.ceil(memberCount / 2)) {
      throw new HttpException(
        '구성원 50% 이상의 좋아요가 필요합니다.',
        HttpStatus.FORBIDDEN,
      );
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.meeting.update({
        where: { id: meetingId },
        data: { status: 'CONFIRMED' },
        select: this.meetingSelect(),
      }),
      this.prisma.groupContent.update({
        where: { id: meeting.groupContentId },
        data: { status: GroupContentStatus.COMPLETED },
      }),
    ]);

    const confirmedDate = meeting.confirmedDate ?? new Date();
    const triggerAt = new Date(confirmedDate);
    triggerAt.setDate(triggerAt.getDate() - 1);
    triggerAt.setHours(9, 0, 0, 0);

    const delay = Math.max(triggerAt.getTime() - Date.now(), MIN_DELAY_MS);

    await this.discussionQueue.add(
      'generate',
      { meetingId },
      {
        delay,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5_000 },
      },
    );

    return updated;
  }

  async doneMeeting(meetingId: string): Promise<MeetingResponseDto> {
    const meeting = await this.prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) throw new NotFoundException('모임을 찾을 수 없습니다');

    return this.prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'DONE' },
      select: this.meetingSelect(),
    });
  }

  private meetingSelect() {
    return {
      id: true,
      groupId: true,
      groupContentId: true,
      confirmedDate: true,
      location: true,
      status: true,
      createdAt: true,
    } as const;
  }
}
