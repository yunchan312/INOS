import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MeetingService, MEETING_INVITE_QUEUE, DISCUSSION_GENERATION_QUEUE } from './meeting.service';
import { MeetingController } from './meeting.controller';
import { MeetingInviteProcessor } from './queues/meeting-invite.processor';
import { DiscussionProcessor } from './queues/discussion.processor';
import { AuthModule } from '../auth/auth.module';
import { GroupModule } from '../group/group.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    AuthModule,
    GroupModule,
    NotificationModule,
    BullModule.registerQueue(
      { name: MEETING_INVITE_QUEUE },
      { name: DISCUSSION_GENERATION_QUEUE },
    ),
  ],
  controllers: [MeetingController],
  providers: [MeetingService, MeetingInviteProcessor, DiscussionProcessor],
  exports: [MeetingService],
})
export class MeetingModule {}
