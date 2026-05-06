import { Module } from '@nestjs/common';
import { ArchiveService } from './archive.service';
import { ArchiveController } from './archive.controller';
import { S3Service } from '../../shared/storage/s3.service';

@Module({
  providers: [ArchiveService, S3Service],
  controllers: [ArchiveController],
})
export class ArchiveModule {}
