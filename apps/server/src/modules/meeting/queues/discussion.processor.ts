import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import axios from 'axios';
import { PrismaService } from '../../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { NotificationService } from '../../notification/notification.service';
import { meetingWorkLabel } from '../../notification/notification.util';
import { DISCUSSION_GENERATION_QUEUE } from '../meeting.service';

interface DiscussionJobData {
  meetingId: string;
}

@Processor(DISCUSSION_GENERATION_QUEUE)
export class DiscussionProcessor extends WorkerHost {
  private readonly logger = new Logger(DiscussionProcessor.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
  ) {
    super();
  }

  async process(job: Job<DiscussionJobData>): Promise<void> {
    const { meetingId } = job.data;
    const aiUrl = this.config.get<string>('AI_SERVER_URL', 'http://localhost:3001');

    this.logger.log(`Triggering discussion generation for meeting ${meetingId}`);

    try {
      // 생성 완료까지 동기 대기(책+영화 최대 수 분). 실패하면 throw → 잡 재시도
      await axios.post(
        `${aiUrl}/ai/discussions/${meetingId}/generate`,
        undefined,
        { timeout: 300_000 },
      );
      this.logger.log(`Discussion generation completed for meeting ${meetingId}`);
    } catch (error) {
      this.logger.error(
        `Failed to trigger discussion generation for meeting ${meetingId}: ${(error as Error).message}`,
      );
      // 마지막 시도까지 실패하면 FAILED로 남긴다 — ai-server에 닿지 못해
      // 그쪽에서 상태를 못 바꾼 경우에도 사용자가 재시도 화면을 볼 수 있어야 한다
      const attempts = job.opts.attempts ?? 1;
      if (job.attemptsMade + 1 >= attempts) {
        await this.prisma.discussion
          .updateMany({
            where: { meetingId, status: 'GENERATING' },
            data: { status: 'FAILED' },
          })
          .catch((e: Error) =>
            this.logger.warn(`발제문 실패 상태 기록 실패: ${e.message}`),
          );
      }
      throw error;
    }

    this.notifyDiscussionReady(meetingId).catch((error: Error) =>
      this.logger.warn(`발제문 도착 알림 실패: ${error.message}`),
    );
  }

  private async notifyDiscussionReady(meetingId: string): Promise<void> {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { group: { select: { name: true } } },
    });
    if (!meeting) return;

    const members = await this.prisma.groupMember.findMany({
      where: { groupId: meeting.groupId },
      select: { user: { select: { id: true, email: true, nickname: true } } },
    });

    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    const meetingUrl = `${frontendUrl}/orgs/${meeting.groupId}/meetings/${meeting.id}`;
    const workLabel = meetingWorkLabel(meeting);

    for (const m of members) {
      await this.notificationService.sendOnce(
        meetingId,
        m.user.id,
        'DISCUSSION_READY',
        () =>
          this.mailService.sendDiscussionReady({
            toEmail: m.user.email,
            toName: m.user.nickname,
            groupName: meeting.group.name,
            workLabel,
            meetingUrl,
          }),
      );
    }
  }
}
