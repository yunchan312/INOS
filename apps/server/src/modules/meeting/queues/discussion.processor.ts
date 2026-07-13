import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import axios from 'axios';
import { DISCUSSION_GENERATION_QUEUE } from '../meeting.service';

interface DiscussionJobData {
  meetingId: string;
}

@Processor(DISCUSSION_GENERATION_QUEUE)
export class DiscussionProcessor extends WorkerHost {
  private readonly logger = new Logger(DiscussionProcessor.name);

  constructor(private readonly config: ConfigService) {
    super();
  }

  async process(job: Job<DiscussionJobData>): Promise<void> {
    const { meetingId } = job.data;
    const aiUrl = this.config.get<string>('AI_SERVER_URL', 'http://localhost:3001');

    this.logger.log(`Triggering discussion generation for meeting ${meetingId}`);

    try {
      await axios.post(`${aiUrl}/ai/discussions/${meetingId}/generate`);
      this.logger.log(`Discussion generation triggered for meeting ${meetingId}`);
    } catch (error) {
      this.logger.error(
        `Failed to trigger discussion generation for meeting ${meetingId}: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
