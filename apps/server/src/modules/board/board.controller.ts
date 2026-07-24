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
import type {
  GroupPostDto,
  GroupPostLikeDto,
  GroupPostListDto,
} from '@inos/types';
import { BoardService } from './board.service';
import { CreateGroupPostDto, UpdateGroupPostDto } from './dto/board.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';

@ApiTags('group-posts')
@Controller('groups/:groupId/posts')
@UseGuards(JwtAuthGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  @ApiOperation({ summary: '하고싶은 말 목록 (최신순, 페이지당 5개)' })
  list(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @CurrentUser() user: AuthUser,
  ): Promise<GroupPostListDto> {
    return this.boardService.list(groupId, user.id, page);
  }

  @Get(':postId')
  @ApiOperation({ summary: '하고싶은 말 상세' })
  findOne(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Param('postId', new ParseUUIDPipe()) postId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<GroupPostDto> {
    return this.boardService.findOne(groupId, postId, user.id);
  }

  @Post()
  @ApiOperation({ summary: '하고싶은 말 등록 (멤버 누구나)' })
  create(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Body() dto: CreateGroupPostDto,
    @CurrentUser() user: AuthUser,
  ): Promise<GroupPostDto> {
    return this.boardService.create(groupId, user.id, dto);
  }

  @Patch(':postId')
  @ApiOperation({ summary: '하고싶은 말 수정 (작성자·오가니제이션 소유자)' })
  update(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Param('postId', new ParseUUIDPipe()) postId: string,
    @Body() dto: UpdateGroupPostDto,
    @CurrentUser() user: AuthUser,
  ): Promise<GroupPostDto> {
    return this.boardService.update(groupId, postId, user.id, dto);
  }

  @Delete(':postId')
  @HttpCode(204)
  @ApiOperation({ summary: '하고싶은 말 삭제 (작성자·오가니제이션 소유자)' })
  async remove(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Param('postId', new ParseUUIDPipe()) postId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.boardService.remove(groupId, postId, user.id);
  }

  @Post(':postId/like')
  @ApiOperation({ summary: '좋아요 토글' })
  toggleLike(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Param('postId', new ParseUUIDPipe()) postId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<GroupPostLikeDto> {
    return this.boardService.toggleLike(groupId, postId, user.id);
  }
}
