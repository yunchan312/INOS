import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationService, NOTIFICATION_REMINDER_QUEUE } from './notification.service';
import { NotificationReminderProcessor } from './queues/notification-reminder.processor';

@Module({
  imports: [BullModule.registerQueue({ name: NOTIFICATION_REMINDER_QUEUE })],
  providers: [NotificationService, NotificationReminderProcessor],
  exports: [NotificationService],
})
export class NotificationModule {}
