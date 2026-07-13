import { Module } from '@nestjs/common';
import { DiscussionController } from './discussion.controller';
import { DiscussionService } from './discussion.service';
import { EventsController } from './events.controller';
import { NotesGateway } from './notes.gateway';

@Module({
  controllers: [DiscussionController, EventsController],
  providers: [DiscussionService, NotesGateway],
})
export class DiscussionModule {}
