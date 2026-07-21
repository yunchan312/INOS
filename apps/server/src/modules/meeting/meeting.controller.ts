import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import type { DiscussionImpressionDto } from '@inos/types';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MeetingService } from './meeting.service';
import {
  CreateMeetingDto,
  MeetingResponseDto,
  SubmitAvailabilityDto,
  SubmitAvailabilityResponseDto,
  UpdateMeetingDto,
  UpsertImpressionDto,
} from './dto/meeting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GroupRoleGuard } from '../auth/guards/group-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';

@ApiTags('meetings')
@Controller('groups/:groupId/meetings')
@UseGuards(JwtAuthGuard)
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post()
  @UseGuards(GroupRoleGuard)
  @Roles('OWNER')
  @ApiOperation({ summary: '새 모임 생성 (소유자)' })
  create(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateMeetingDto,
  ): Promise<MeetingResponseDto> {
    return this.meetingService.create(groupId, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: '오가니제이션 모임 목록 (멤버)' })
  list(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<MeetingResponseDto[]> {
    return this.meetingService.list(groupId, user.id);
  }

  @Get(':meetingId')
  @ApiOperation({ summary: '모임 상세 (멤버)' })
  findOne(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Param('meetingId', new ParseUUIDPipe()) meetingId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<MeetingResponseDto> {
    return this.meetingService.findOne(groupId, meetingId, user.id);
  }

  @Patch(':meetingId')
  @UseGuards(GroupRoleGuard)
  @Roles('OWNER')
  @ApiOperation({ summary: '모임 수정 (소유자)' })
  update(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Param('meetingId', new ParseUUIDPipe()) meetingId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateMeetingDto,
  ): Promise<MeetingResponseDto> {
    return this.meetingService.update(groupId, meetingId, dto, user.id);
  }

  @Delete(':meetingId')
  @UseGuards(GroupRoleGuard)
  @Roles('OWNER')
  @HttpCode(204)
  @ApiOperation({ summary: '모임 삭제 (소유자)' })
  remove(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Param('meetingId', new ParseUUIDPipe()) meetingId: string,
  ): Promise<void> {
    return this.meetingService.remove(groupId, meetingId);
  }

  @Post(':meetingId/availability')
  @ApiOperation({ summary: '가능한 날짜 제출 (멤버)' })
  submitAvailability(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Param('meetingId', new ParseUUIDPipe()) meetingId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: SubmitAvailabilityDto,
  ): Promise<SubmitAvailabilityResponseDto> {
    return this.meetingService.submitAvailability(groupId, meetingId, user.id, dto);
  }

  @Get(':meetingId/impressions')
  @ApiOperation({ summary: '작품 감상 목록 (멤버)' })
  listImpressions(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Param('meetingId', new ParseUUIDPipe()) meetingId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<DiscussionImpressionDto[]> {
    return this.meetingService.listImpressions(groupId, meetingId, user.id);
  }

  @Put(':meetingId/impression')
  @ApiOperation({ summary: '내 작품 감상 저장 (빈 값이면 삭제, 멤버)' })
  upsertImpression(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Param('meetingId', new ParseUUIDPipe()) meetingId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpsertImpressionDto,
  ): Promise<DiscussionImpressionDto | null> {
    return this.meetingService.upsertImpression(
      groupId,
      meetingId,
      user.id,
      dto.content,
    );
  }

  @Post(':meetingId/done')
  @ApiOperation({ summary: '모임 종료 (멤버)' })
  finish(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Param('meetingId', new ParseUUIDPipe()) meetingId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<MeetingResponseDto> {
    return this.meetingService.finish(groupId, meetingId, user.id);
  }
}
