import { Controller, Get, Patch, Delete, Body, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { UserService } from './user.service';
import { UpdateUserDto, UpdateTasteDto, UserResponseDto } from './dto/user.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: '내 프로필 조회' })
  getMe(@CurrentUser() user: User): Promise<UserResponseDto> {
    return this.userService.findById(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: '내 프로필 수정' })
  updateMe(
    @CurrentUser() user: User,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(user.id, dto);
  }

  @Patch('me/taste')
  @ApiOperation({ summary: '취향 프로필 업데이트' })
  updateTaste(
    @CurrentUser() user: User,
    @Body() dto: UpdateTasteDto,
  ): Promise<UserResponseDto> {
    return this.userService.updateTaste(user.id, dto);
  }

  @Delete('me')
  @HttpCode(204)
  @ApiOperation({ summary: '회원 탈퇴' })
  deleteMe(@CurrentUser() user: User): Promise<void> {
    return this.userService.deleteUser(user.id);
  }
}
