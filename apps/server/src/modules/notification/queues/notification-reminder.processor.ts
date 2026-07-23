import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { MeetingStatus } from '@prisma/client';
import { Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import {
  AVAILABILITY_REMINDER_JOB,
  MEETING_REMINDER_JOB,
  NOTIFICATION_REMINDER_QUEUE,
  NotificationService,
} from '../notification.service';
import { formatDateLabel, meetingWorkLabel } from '../notification.util';

interface ReminderJobData {
  meetingId: string;
}

@Processor(NOTIFICATION_REMINDER_QUEUE)
export class NotificationReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationReminderProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async process(job: Job<ReminderJobData>): Promise<void> {
    if (job.name === MEETING_REMINDER_JOB) {
      await this.handleMeetingReminder(job.data.meetingId);
    } else if (job.name === AVAILABILITY_REMINDER_JOB) {
      await this.handleAvailabilityReminder(job.data.meetingId);
    }
  }

  private async handleMeetingReminder(meetingId: string): Promise<void> {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { group: true },
    });
    // 취소/삭제/재확정으로 대상이 아니게 됐으면 스킵 (날짜 변경 시 스케줄은 재예약됨)
    if (!meeting || meeting.status !== MeetingStatus.CONFIRMED || !meeting.confirmedDate) {
      return;
    }

    const members = await this.prisma.groupMember.findMany({
      where: { groupId: meeting.groupId },
      include: { user: { select: { id: true, email: true, nickname: true } } },
    });

    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    const meetingUrl = `${frontendUrl}/orgs/${meeting.groupId}/meetings/${meeting.id}`;
    const workLabel = meetingWorkLabel(meeting);
    const dateLabel = formatDateLabel(meeting.confirmedDate);

    for (const m of members) {
      await this.notificationService.sendOnce(
        meetingId,
        m.user.id,
        'MEETING_REMINDER_3H',
        () =>
          this.mailService.sendMeetingReminder({
            toEmail: m.user.email,
            toName: m.user.nickname,
            groupName: meeting.group.name,
            workLabel,
            dateLabel,
            meetingUrl,
          }),
      );
    }
  }

  private async handleAvailabilityReminder(meetingId: string): Promise<void> {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { group: true, availabilities: { select: { userId: true } } },
    });
    // 이미 확정/취소됐으면 응답 독촉이 필요 없음
    if (!meeting || meeting.status !== MeetingStatus.PENDING) return;

    const respondedIds = new Set(meeting.availabilities.map((a) => a.userId));
    const members = await this.prisma.groupMember.findMany({
      where: { groupId: meeting.groupId },
      include: { user: { select: { id: true, email: true, nickname: true } } },
    });

    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    const availabilityUrl = `${frontendUrl}/orgs/${meeting.groupId}/meetings/${meeting.id}/availability`;
    const workLabel = meetingWorkLabel(meeting);

    for (const m of members) {
      if (respondedIds.has(m.user.id)) continue;
      await this.notificationService.sendOnce(
        meetingId,
        m.user.id,
        'AVAILABILITY_REMINDER',
        () =>
          this.mailService.sendAvailabilityReminder({
            toEmail: m.user.email,
            toName: m.user.nickname,
            groupName: meeting.group.name,
            workLabel,
            availabilityUrl,
          }),
      );
    }
  }
}
