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
import { ScheduleService } from './schedule.service';
import {
  CreateMeetingDto,
  UpdateMeetingDto,
  AvailabilityDto,
  MeetingResponseDto,
} from './dto/schedule.dto';

@ApiTags('meetings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('groups')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post(':groupId/meetings')
  @ApiOperation({ summary: '모임 생성' })
  create(
    @Param('groupId') groupId: string,
    @Body() dto: CreateMeetingDto,
  ): Promise<MeetingResponseDto> {
    return this.scheduleService.create(groupId, dto);
  }

  @Get(':groupId/meetings')
  @ApiOperation({ summary: '그룹 모임 목록' })
  findByGroup(@Param('groupId') groupId: string): Promise<MeetingResponseDto[]> {
    return this.scheduleService.findByGroup(groupId);
  }

  @Patch(':groupId/meetings/:meetingId')
  @ApiOperation({ summary: '모임 수정' })
  update(
    @Param('meetingId') meetingId: string,
    @Body() dto: UpdateMeetingDto,
  ): Promise<MeetingResponseDto> {
    return this.scheduleService.update(meetingId, dto);
  }

  @Delete(':groupId/meetings/:meetingId')
  @HttpCode(204)
  @ApiOperation({ summary: '모임 삭제' })
  remove(@Param('meetingId') meetingId: string): Promise<void> {
    return this.scheduleService.remove(meetingId);
  }

  @Post(':groupId/meetings/:meetingId/availability')
  @HttpCode(200)
  @ApiOperation({ summary: '가용 날짜 등록/수정 (upsert)' })
  addAvailability(
    @Param('meetingId') meetingId: string,
    @CurrentUser() user: User,
    @Body() dto: AvailabilityDto,
  ): Promise<void> {
    return this.scheduleService.addAvailability(meetingId, user.id, dto);
  }

  @Post(':groupId/meetings/:meetingId/confirm')
  @HttpCode(200)
  @ApiOperation({ summary: '모임 확정 (D-1 발제문 예약 + 콘텐츠 COMPLETED)' })
  confirm(@Param('meetingId') meetingId: string): Promise<MeetingResponseDto> {
    return this.scheduleService.confirmMeeting(meetingId);
  }

  @Post(':groupId/meetings/:meetingId/done')
  @HttpCode(200)
  @ApiOperation({ summary: '모임 종료' })
  done(@Param('meetingId') meetingId: string): Promise<MeetingResponseDto> {
    return this.scheduleService.doneMeeting(meetingId);
  }
}
