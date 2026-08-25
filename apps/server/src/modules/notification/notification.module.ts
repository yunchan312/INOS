import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationService, NOTIFICATION_REMINDER_QUEUE } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationReminderProcessor } from './queues/notification-reminder.processor';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    BullModule.registerQueue({ name: NOTIFICATION_REMINDER_QUEUE }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationReminderProcessor],
  exports: [NotificationService],
})
export class NotificationModule {}
