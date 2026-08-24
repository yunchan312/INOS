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
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MeetingService } from './meeting.service';
import {
  CreateMeetingDto,
  MeetingResponseDto,
  SubmitAvailabilityDto,
  SubmitAvailabilityResponseDto,
  RetryDiscussionDto,
  UpdateMeetingDto,
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

  @Post(':meetingId/discussion/retry')
  @UseGuards(GroupRoleGuard)
  @Roles('OWNER')
  @ApiOperation({
    summary: '발제문 생성 재시도 (소유자) — 작품 정보를 함께 고칠 수 있음',
  })
  retryDiscussion(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Param('meetingId', new ParseUUIDPipe()) meetingId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: RetryDiscussionDto,
  ): Promise<MeetingResponseDto> {
    return this.meetingService.retryDiscussion(groupId, meetingId, dto, user.id);
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
