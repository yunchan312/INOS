import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GroupService } from './group.service';
import {
  InvitationAcceptResponseDto,
  InvitationPreviewDto,
} from './dto/invitation.dto';
import type {
  InviteLinkAcceptResponseDto,
  InviteLinkPreviewDto,
} from '@inos/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationController {
  constructor(private readonly groupService: GroupService) {}

  @Get('link/:token')
  @ApiOperation({ summary: '초대 링크 프리뷰 (공개)' })
  linkPreview(@Param('token') token: string): Promise<InviteLinkPreviewDto> {
    return this.groupService.getInviteLinkPreview(token);
  }

  @Post('link/:token/accept')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '초대 링크로 참여 (로그인 필요, 이메일 불문)' })
  linkAccept(
    @Param('token') token: string,
    @CurrentUser() user: AuthUser,
  ): Promise<InviteLinkAcceptResponseDto> {
    return this.groupService.acceptInviteLink(token, user.id);
  }

  @Get(':token')
  @ApiOperation({ summary: '초대장 프리뷰 (공개)' })
  preview(@Param('token') token: string): Promise<InvitationPreviewDto> {
    return this.groupService.getInvitationPreview(token);
  }

  @Post(':token/accept')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '초대장 수락 (로그인 필요)' })
  accept(
    @Param('token') token: string,
    @CurrentUser() user: AuthUser,
  ): Promise<InvitationAcceptResponseDto> {
    return this.groupService.acceptInvitation(token, user.id);
  }
}
