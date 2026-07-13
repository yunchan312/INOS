import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GroupService } from './group.service';
import {
  GroupDetailDto,
  GroupMemberDto,
  GroupSummaryDto,
  UpdateGroupSettingsDto,
} from './dto/group.dto';
import {
  InviteMemberDto,
  InvitationPreviewDto,
} from './dto/invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GroupRoleGuard } from '../auth/guards/group-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';

@ApiTags('groups')
@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  @ApiOperation({ summary: '내가 속한 오가니제이션 목록' })
  findMine(@CurrentUser() user: AuthUser): Promise<GroupSummaryDto[]> {
    return this.groupService.findMineForUser(user.id);
  }

  @Get(':groupId')
  @ApiOperation({ summary: '오가니제이션 상세 (멤버 전용)' })
  findOne(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<GroupDetailDto> {
    return this.groupService.findDetailForUser(groupId, user.id);
  }

  @Get(':groupId/members')
  @ApiOperation({ summary: '오가니제이션 멤버 목록' })
  listMembers(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<GroupMemberDto[]> {
    return this.groupService.listMembers(groupId, user.id);
  }

  @Patch(':groupId/settings')
  @UseGuards(GroupRoleGuard)
  @Roles('OWNER')
  @ApiOperation({ summary: '오가니제이션 설정 변경 (소유자)' })
  updateSettings(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Body() dto: UpdateGroupSettingsDto,
  ): Promise<GroupDetailDto> {
    return this.groupService.updateSettings(groupId, dto);
  }

  @Post(':groupId/members/invite')
  @UseGuards(GroupRoleGuard)
  @Roles('OWNER')
  @ApiOperation({ summary: '멤버 이메일 초대 (소유자)' })
  invite(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: InviteMemberDto,
  ): Promise<InvitationPreviewDto> {
    return this.groupService.inviteMember(groupId, user.id, dto.email);
  }

  @Delete(':groupId/members/:userId')
  @UseGuards(GroupRoleGuard)
  @Roles('OWNER')
  @ApiOperation({ summary: '멤버 제거 (소유자, 자기 자신 제외)' })
  removeMember(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Param('userId', new ParseUUIDPipe()) targetUserId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    return this.groupService.removeMember(groupId, targetUserId, user.id);
  }
}
