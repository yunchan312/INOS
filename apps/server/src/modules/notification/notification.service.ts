import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { NotificationType } from '@prisma/client';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';

export const NOTIFICATION_REMINDER_QUEUE = 'notification-reminder';
export const MEETING_REMINDER_JOB = 'meeting-reminder';
export const AVAILABILITY_REMINDER_JOB = 'availability-reminder';

// 모임 확정일에는 시각 정보가 없으므로, 저녁 모임을 기본 가정해 "3시간 전" 시각을 계산한다.
const DEFAULT_MEETING_HOUR = 19;
const AVAILABILITY_REMINDER_DELAY_MS = 48 * 60 * 60 * 1000;
const REMINDER_LEAD_MS = 3 * 60 * 60 * 1000;

interface MeetingReminderJobData {
  meetingId: string;
}

interface AvailabilityReminderJobData {
  meetingId: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @InjectQueue(NOTIFICATION_REMINDER_QUEUE)
    private readonly reminderQueue: Queue<
      MeetingReminderJobData | AvailabilityReminderJobData
    >,
  ) {}

  // (모임, 수신자, 종류)당 최초 1회만 발송 — 재시도/재확정으로 인한 중복 발송 방지
  async sendOnce(
    meetingId: string,
    userId: string,
    type: NotificationType,
    send: () => Promise<void>,
  ): Promise<void> {
    const existing = await this.prisma.notificationLog.findUnique({
      where: { meetingId_userId_type: { meetingId, userId, type } },
    });
    if (existing) return;

    try {
      await send();
    } catch (error) {
      this.logger.warn(
        `알림 발송 실패(${type}, meeting=${meetingId}, user=${userId}): ${(error as Error).message}`,
      );
      return; // 발송 실패는 로그만 — 다음 트리거 때 재시도되지 않도록 기록은 남기지 않는다
    }

    await this.prisma.notificationLog.upsert({
      where: { meetingId_userId_type: { meetingId, userId, type } },
      update: {},
      create: { meetingId, userId, type },
    });
  }

  // 모임 시작 시각 계산 — confirmedTime("HH:mm")이 있으면 그대로, 없으면 저녁(기본 19시) 가정
  getAssumedMeetingDateTime(confirmedDate: Date, confirmedTime?: string | null): Date {
    const dt = new Date(confirmedDate);
    const parsed = confirmedTime?.match(/^(\d{2}):(\d{2})$/);
    if (parsed) {
      dt.setHours(Number(parsed[1]), Number(parsed[2]), 0, 0);
      return dt;
    }
    const hour = Number(
      this.config.get<string>('MEETING_DEFAULT_HOUR', String(DEFAULT_MEETING_HOUR)),
    );
    dt.setHours(hour, 0, 0, 0);
    return dt;
  }

  async scheduleMeetingReminder(
    meetingId: string,
    confirmedDate: Date,
    confirmedTime?: string | null,
  ): Promise<void> {
    await this.cancelMeetingReminder(meetingId);

    const meetingAt = this.getAssumedMeetingDateTime(confirmedDate, confirmedTime);
    const delay = meetingAt.getTime() - REMINDER_LEAD_MS - Date.now();
    if (delay <= 0) return; // 이미 지난 시각이면 예약하지 않음

    // BullMQ 커스텀 jobId에는 ':'를 쓸 수 없음(Redis 키 구분자와 충돌)
    await this.reminderQueue.add(
      MEETING_REMINDER_JOB,
      { meetingId },
      {
        jobId: `${MEETING_REMINDER_JOB}-${meetingId}`,
        delay,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }

  async cancelMeetingReminder(meetingId: string): Promise<void> {
    const job = await this.reminderQueue.getJob(`${MEETING_REMINDER_JOB}-${meetingId}`);
    if (job) await job.remove();
  }

  async scheduleAvailabilityReminder(meetingId: string): Promise<void> {
    await this.reminderQueue.add(
      AVAILABILITY_REMINDER_JOB,
      { meetingId },
      {
        jobId: `${AVAILABILITY_REMINDER_JOB}-${meetingId}`,
        delay: AVAILABILITY_REMINDER_DELAY_MS,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }

  async cancelAvailabilityReminder(meetingId: string): Promise<void> {
    const job = await this.reminderQueue.getJob(
      `${AVAILABILITY_REMINDER_JOB}-${meetingId}`,
    );
    if (job) await job.remove();
  }
}
