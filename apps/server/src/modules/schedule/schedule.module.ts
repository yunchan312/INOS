import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { DiscussionProcessor } from './discussion.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'discussion-generation' }),
  ],
  providers: [ScheduleService, DiscussionProcessor],
  controllers: [ScheduleController],
})
export class ScheduleModule {}
