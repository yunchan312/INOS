import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import {
  CurrentUser,
  AuthUser,
} from '../auth/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import {
  AdminOrgDto,
  CreateOrgDto,
  CreateOrgResponseDto,
  PaginatedOrgsDto,
  PaginatedUsersDto,
  SetAdminDto,
  UpdateOrgDto,
} from './dto/admin.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('orgs')
  @ApiOperation({ summary: '오가니제이션 목록/검색/필터 (관리자 전용, 30개 단위)' })
  listOrgs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('minMembers', new DefaultValuePipe(0), ParseIntPipe)
    minMembers: number,
    @Query('search') search?: string,
    @Query('member') member?: string,
  ): Promise<PaginatedOrgsDto> {
    return this.adminService.listOrgs({ search, member, minMembers, page });
  }

  @Get('users')
  @ApiOperation({ summary: '사용자 목록/검색/필터 (관리자 전용, 30개 단위)' })
  listUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('search') search?: string,
    @Query('joinedAfter') joinedAfter?: string,
    @Query('adminOnly') adminOnly?: string,
  ): Promise<PaginatedUsersDto> {
    return this.adminService.listUsers({
      search,
      joinedAfter,
      adminOnly: adminOnly === 'true',
      page,
    });
  }

  @Patch('users/:userId/admin')
  @ApiOperation({ summary: '관리자 권한 부여/해제 (관리자 전용)' })
  setUserAdmin(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: SetAdminDto,
    @CurrentUser() caller: AuthUser,
  ): Promise<{ id: string; isAdmin: boolean }> {
    return this.adminService.setUserAdmin(userId, dto.isAdmin, caller.id);
  }

  @Delete('users/:userId')
  @HttpCode(204)
  @ApiOperation({ summary: '사용자 삭제 (관리자 전용)' })
  async deleteUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() caller: AuthUser,
  ): Promise<void> {
    await this.adminService.deleteUser(userId, caller.id);
  }

  @Post('orgs')
  @ApiOperation({ summary: '새 오가니제이션 생성 (관리자 전용)' })
  createOrg(@Body() dto: CreateOrgDto): Promise<CreateOrgResponseDto> {
    return this.adminService.createOrg(dto);
  }

  @Patch('orgs/:orgId')
  @ApiOperation({ summary: '오가니제이션 수정 (관리자 전용)' })
  updateOrg(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Body() dto: UpdateOrgDto,
  ): Promise<AdminOrgDto> {
    return this.adminService.updateOrg(orgId, dto);
  }

  @Delete('orgs/:orgId')
  @HttpCode(204)
  @ApiOperation({ summary: '오가니제이션 삭제 (관리자 전용)' })
  async deleteOrg(
    @Param('orgId', ParseUUIDPipe) orgId: string,
  ): Promise<void> {
    await this.adminService.deleteOrg(orgId);
  }
}
