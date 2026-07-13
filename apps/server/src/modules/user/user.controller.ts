import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto, UserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: '내 프로필 조회' })
  async me(@CurrentUser() user: AuthUser): Promise<UserDto> {
    const record = await this.userService.findById(user.id);
    if (!record) throw new Error('사용자를 찾을 수 없습니다');
    return {
      id: record.id,
      email: record.email,
      nickname: record.nickname,
      profileImageUrl: record.profileImageUrl,
      createdAt: record.createdAt,
    };
  }

  @Patch('me')
  @ApiOperation({ summary: '내 프로필 수정' })
  async updateMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateUserDto,
  ): Promise<UserDto> {
    const updated = await this.userService.update(user.id, dto);
    return {
      id: updated.id,
      email: updated.email,
      nickname: updated.nickname,
      profileImageUrl: updated.profileImageUrl,
      createdAt: updated.createdAt,
    };
  }
}
