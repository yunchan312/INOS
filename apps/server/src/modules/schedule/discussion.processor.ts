import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

interface DiscussionGenerationJobData {
  meetingId: string;
}

@Processor('discussion-generation')
export class DiscussionProcessor extends WorkerHost {
  private readonly logger = new Logger(DiscussionProcessor.name);

  constructor(private readonly config: ConfigService) {
    super();
  }

  async process(job: Job<DiscussionGenerationJobData>): Promise<void> {
    const { meetingId } = job.data;
    this.logger.log(`발제문 생성 작업 시작: meetingId=${meetingId}`);

    const aiServerUrl = this.config.get<string>('AI_SERVER_URL', 'http://localhost:3001');

    try {
      await axios.get(`${aiServerUrl}/api/discussion/stream/${meetingId}`, {
        responseType: 'stream',
        timeout: 120_000,
      });
      this.logger.log(`발제문 생성 완료: meetingId=${meetingId}`);
    } catch (err) {
      this.logger.error(`발제문 생성 실패: meetingId=${meetingId}`, err);
      throw err;
    }
  }
}
