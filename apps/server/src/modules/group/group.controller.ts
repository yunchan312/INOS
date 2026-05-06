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
import { GroupService } from './group.service';
import {
  CreateGroupDto,
  UpdateGroupDto,
  InviteMemberDto,
  JoinGroupDto,
  GroupResponseDto,
  GroupMemberResponseDto,
} from './dto/group.dto';

@ApiTags('groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @ApiOperation({ summary: '그룹 생성' })
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateGroupDto,
  ): Promise<GroupResponseDto> {
    return this.groupService.create(user.id, dto);
  }

  @Get('me')
  @ApiOperation({ summary: '내 그룹 목록' })
  findAll(@CurrentUser() user: User): Promise<GroupResponseDto[]> {
    return this.groupService.findAll(user.id);
  }

  @Post('join')
  @HttpCode(200)
  @ApiOperation({ summary: '초대 코드로 그룹 참가' })
  join(
    @CurrentUser() user: User,
    @Body() dto: JoinGroupDto,
  ): Promise<void> {
    return this.groupService.join(user.id, dto.inviteCode);
  }

  @Get(':groupId')
  @ApiOperation({ summary: '그룹 상세 조회' })
  findOne(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
  ): Promise<GroupResponseDto> {
    return this.groupService.findOne(groupId, user.id);
  }

  @Patch(':groupId')
  @ApiOperation({ summary: '그룹 수정' })
  update(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateGroupDto,
  ): Promise<GroupResponseDto> {
    return this.groupService.update(groupId, user.id, dto);
  }

  @Delete(':groupId')
  @HttpCode(204)
  @ApiOperation({ summary: '그룹 삭제' })
  remove(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.groupService.remove(groupId, user.id);
  }

  @Post(':groupId/invite/refresh')
  @HttpCode(200)
  @ApiOperation({ summary: '초대 코드 갱신' })
  refreshInviteCode(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
  ): Promise<{ inviteCode: string }> {
    return this.groupService.refreshInviteCode(groupId, user.id);
  }

  @Get(':groupId/members')
  @ApiOperation({ summary: '그룹 멤버 조회' })
  getMembers(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
  ): Promise<GroupMemberResponseDto[]> {
    return this.groupService.getMembers(groupId, user.id);
  }

  @Post(':groupId/members')
  @HttpCode(200)
  @ApiOperation({ summary: '멤버 초대' })
  inviteMember(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
    @Body() dto: InviteMemberDto,
  ): Promise<void> {
    return this.groupService.inviteMember(groupId, user.id, dto.userId);
  }

  @Delete(':groupId/members/:userId')
  @HttpCode(204)
  @ApiOperation({ summary: '멤버 강퇴' })
  removeMember(
    @Param('groupId') groupId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.groupService.removeMember(groupId, user.id, targetUserId);
  }
}
