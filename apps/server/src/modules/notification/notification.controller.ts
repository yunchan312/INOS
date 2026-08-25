import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { NotificationListDto } from '@inos/types';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: '내 알림 목록 (최신순)' })
  list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @CurrentUser() user: AuthUser,
  ): Promise<NotificationListDto> {
    return this.notificationService.listForUser(user.id, page);
  }

  @Post('read-all')
  @HttpCode(204)
  @ApiOperation({ summary: '안 읽은 알림 전체 읽음 처리' })
  async markAllRead(@CurrentUser() user: AuthUser): Promise<void> {
    await this.notificationService.markAllRead(user.id);
  }

  @Post(':notificationId/read')
  @HttpCode(204)
  @ApiOperation({ summary: '알림 하나 읽음 처리' })
  async markRead(
    @Param('notificationId', new ParseUUIDPipe()) notificationId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.notificationService.markRead(user.id, notificationId);
  }
}
