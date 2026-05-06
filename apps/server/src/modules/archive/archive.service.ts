import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { S3Service } from '../../shared/storage/s3.service';
import {
  CreateArchiveDto,
  UpdateArchiveDto,
  PresignedUrlDto,
  ArchiveResponseDto,
  ArchiveSummaryResponseDto,
} from './dto/archive.dto';

@Injectable()
export class ArchiveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  async createArchive(
    userId: string,
    groupId: string,
    dto: CreateArchiveDto,
  ): Promise<ArchiveResponseDto> {
    const meeting = await this.prisma.meeting.findFirst({
      where: { id: dto.meetingId, groupId },
    });
    if (!meeting) throw new NotFoundException('모임을 찾을 수 없습니다');

    const archive = await this.prisma.archive.create({
      data: {
        meetingId: dto.meetingId,
        groupId,
        userId,
        body: dto.body,
        photoUrls: dto.photoUrls ?? [],
      },
    });

    return this.toResponse(archive);
  }

  async getGroupArchives(groupId: string): Promise<ArchiveResponseDto[]> {
    const archives = await this.prisma.archive.findMany({
      where: { groupId },
      orderBy: { archivedAt: 'desc' },
    });
    return archives.map((a) => this.toResponse(a));
  }

  async getArchive(groupId: string, archiveId: string): Promise<ArchiveResponseDto> {
    const archive = await this.prisma.archive.findFirst({
      where: { id: archiveId, groupId },
    });
    if (!archive) throw new NotFoundException('아카이브를 찾을 수 없습니다');
    return this.toResponse(archive);
  }

  async updateArchive(
    userId: string,
    groupId: string,
    archiveId: string,
    dto: UpdateArchiveDto,
  ): Promise<ArchiveResponseDto> {
    const archive = await this.prisma.archive.findFirst({
      where: { id: archiveId, groupId },
    });
    if (!archive) throw new NotFoundException('아카이브를 찾을 수 없습니다');
    if (archive.userId !== userId) throw new ForbiddenException('본인 아카이브만 수정할 수 있습니다');

    const updated = await this.prisma.archive.update({
      where: { id: archiveId },
      data: {
        ...(dto.body !== undefined && { body: dto.body }),
        ...(dto.photoUrls !== undefined && { photoUrls: dto.photoUrls }),
      },
    });

    return this.toResponse(updated);
  }

  async deleteArchive(
    userId: string,
    groupId: string,
    archiveId: string,
  ): Promise<void> {
    const archive = await this.prisma.archive.findFirst({
      where: { id: archiveId, groupId },
    });
    if (!archive) throw new NotFoundException('아카이브를 찾을 수 없습니다');
    if (archive.userId !== userId) throw new ForbiddenException('본인 아카이브만 삭제할 수 있습니다');

    await this.prisma.archive.delete({ where: { id: archiveId } });
  }

  async getUserArchives(userId: string): Promise<ArchiveResponseDto[]> {
    const archives = await this.prisma.archive.findMany({
      where: { userId },
      orderBy: { archivedAt: 'desc' },
    });
    return archives.map((a) => this.toResponse(a));
  }

  async getGroupArchiveSummary(groupId: string): Promise<ArchiveSummaryResponseDto[]> {
    const meetings = await this.prisma.meeting.findMany({
      where: { groupId, status: 'DONE' },
      include: {
        groupContent: {
          include: {
            content: { select: { id: true, title: true, type: true } },
          },
        },
        summary: { select: { summary: true } },
        discussion: {
          select: {
            generatedBody: true,
            editedBody: true,
            publishedAt: true,
          },
        },
      },
      orderBy: { confirmedDate: 'desc' },
    });

    return meetings.map((m) => ({
      meetingId: m.id,
      groupId: m.groupId,
      content: m.groupContent.content,
      summary: m.summary?.summary ?? null,
      discussion: m.discussion
        ? {
            generatedBody: m.discussion.generatedBody,
            editedBody: m.discussion.editedBody,
            publishedAt: m.discussion.publishedAt,
          }
        : null,
      meeting: {
        confirmedDate: m.confirmedDate,
        status: m.status,
      },
    }));
  }

  async getPresignedUploadUrl(
    dto: PresignedUrlDto,
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    return this.s3.getPresignedUploadUrl(dto.key, dto.contentType);
  }

  private toResponse(archive: {
    id: string;
    meetingId: string;
    groupId: string;
    userId: string;
    body: string | null;
    photoUrls: unknown;
    archivedAt: Date;
  }): ArchiveResponseDto {
    return {
      id: archive.id,
      meetingId: archive.meetingId,
      groupId: archive.groupId,
      userId: archive.userId,
      body: archive.body,
      photoUrls: Array.isArray(archive.photoUrls) ? (archive.photoUrls as string[]) : [],
      archivedAt: archive.archivedAt,
    };
  }
}
