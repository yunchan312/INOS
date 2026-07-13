import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { MEETING_INVITE_QUEUE } from '../meeting.service';

interface MeetingInviteJobData {
  meetingId: string;
  memberUserId: string;
}

@Processor(MEETING_INVITE_QUEUE)
export class MeetingInviteProcessor extends WorkerHost {
  private readonly logger = new Logger(MeetingInviteProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async process(job: Job<MeetingInviteJobData>): Promise<void> {
    const { meetingId, memberUserId } = job.data;

    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { group: true },
    });
    if (!meeting) {
      this.logger.warn(`meeting ${meetingId} 이 없어 스킵`);
      return;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: memberUserId },
      select: { email: true, nickname: true },
    });
    if (!user) {
      this.logger.warn(`user ${memberUserId} 이 없어 스킵`);
      return;
    }

    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    const availabilityUrl = `${frontendUrl}/orgs/${meeting.groupId}/meetings/${meeting.id}/availability`;

    await this.mailService.sendMeetingInvite({
      toEmail: user.email,
      toName: user.nickname,
      groupName: meeting.group.name,
      greeting: meeting.group.greeting,
      bookTitle: meeting.bookTitle,
      bookAuthor: meeting.bookAuthor,
      movieTitle: meeting.movieTitle,
      movieDirector: meeting.movieDirector,
      candidateFrom: meeting.candidateFrom,
      candidateTo: meeting.candidateTo,
      availabilityUrl,
    });
  }
}
