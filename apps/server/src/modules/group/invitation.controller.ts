import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GroupService } from './group.service';
import {
  InvitationAcceptResponseDto,
  InvitationPreviewDto,
} from './dto/invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationController {
  constructor(private readonly groupService: GroupService) {}

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
