import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { ArchiveService } from './archive.service';
import {
  CreateArchiveDto,
  UpdateArchiveDto,
  PresignedUrlDto,
  ArchiveResponseDto,
  ArchiveSummaryResponseDto,
} from './dto/archive.dto';

@ApiTags('archives')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Get('users/me/archives')
  @ApiOperation({ summary: '내 아카이브 목록' })
  getUserArchives(@CurrentUser() user: User): Promise<ArchiveResponseDto[]> {
    return this.archiveService.getUserArchives(user.id);
  }

  @Post('archives/upload-url')
  @HttpCode(200)
  @ApiOperation({ summary: 'S3 presigned upload URL 발급' })
  getPresignedUploadUrl(
    @Body() dto: PresignedUrlDto,
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    return this.archiveService.getPresignedUploadUrl(dto);
  }

  @Get('groups/:groupId/archives/summary')
  @ApiOperation({ summary: '그룹 아카이브 요약 (종료된 모임 기록)' })
  getGroupArchiveSummary(
    @Param('groupId') groupId: string,
  ): Promise<ArchiveSummaryResponseDto[]> {
    return this.archiveService.getGroupArchiveSummary(groupId);
  }

  @Get('groups/:groupId/archives')
  @ApiOperation({ summary: '그룹 아카이브 목록' })
  getGroupArchives(@Param('groupId') groupId: string): Promise<ArchiveResponseDto[]> {
    return this.archiveService.getGroupArchives(groupId);
  }

  @Post('groups/:groupId/archives')
  @ApiOperation({ summary: '아카이브 작성' })
  createArchive(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateArchiveDto,
  ): Promise<ArchiveResponseDto> {
    return this.archiveService.createArchive(user.id, groupId, dto);
  }

  @Get('groups/:groupId/archives/:archiveId')
  @ApiOperation({ summary: '아카이브 상세 조회' })
  getArchive(
    @Param('groupId') groupId: string,
    @Param('archiveId') archiveId: string,
  ): Promise<ArchiveResponseDto> {
    return this.archiveService.getArchive(groupId, archiveId);
  }

  @Patch('groups/:groupId/archives/:archiveId')
  @ApiOperation({ summary: '아카이브 수정 (본인만)' })
  updateArchive(
    @Param('groupId') groupId: string,
    @Param('archiveId') archiveId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateArchiveDto,
  ): Promise<ArchiveResponseDto> {
    return this.archiveService.updateArchive(user.id, groupId, archiveId, dto);
  }

  @Delete('groups/:groupId/archives/:archiveId')
  @HttpCode(204)
  @ApiOperation({ summary: '아카이브 삭제 (본인만)' })
  deleteArchive(
    @Param('groupId') groupId: string,
    @Param('archiveId') archiveId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.archiveService.deleteArchive(user.id, groupId, archiveId);
  }
}
