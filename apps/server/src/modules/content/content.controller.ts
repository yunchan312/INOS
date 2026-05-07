import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { ContentService } from './content.service';
import {
  SearchContentDto,
  ListContentDto,
  AddGroupContentDto,
  AddUserContentDto,
  VoteGroupContentDto,
  UpdateGroupContentStatusDto,
  UpdateUserContentDto,
  ContentResponseDto,
  ContentListResponseDto,
  GroupContentResponseDto,
  UserContentResponseDto,
} from './dto/content.dto';

@ApiTags('contents')
@Controller('')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('contents')
  @ApiOperation({ summary: '콘텐츠 목록 (영화/책, 무한 스크롤, 50개씩)' })
  list(@Query() dto: ListContentDto): Promise<ContentListResponseDto> {
    return this.contentService.list(dto);
  }

  @Get('contents/search')
  @ApiOperation({ summary: '콘텐츠 검색 (DB 우선, 외부 API 폴백)' })
  search(@Query() dto: SearchContentDto): Promise<ContentResponseDto[]> {
    return this.contentService.search(dto);
  }

  @Get('contents/:contentId')
  @ApiOperation({ summary: '콘텐츠 상세 조회' })
  findContent(@Param('contentId') contentId: string): Promise<ContentResponseDto> {
    return this.contentService.findContent(contentId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('users/me/contents')
  @ApiOperation({ summary: '내 콘텐츠 목록' })
  getUserContents(@CurrentUser() user: User): Promise<UserContentResponseDto[]> {
    return this.contentService.getUserContents(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('users/me/contents')
  @ApiOperation({ summary: '내 콘텐츠 추가' })
  addUserContent(
    @CurrentUser() user: User,
    @Body() dto: AddUserContentDto,
  ): Promise<UserContentResponseDto> {
    return this.contentService.addUserContent(user.id, dto.contentId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('users/me/contents/:userContentId')
  @HttpCode(204)
  @ApiOperation({ summary: '내 콘텐츠 상태 수정' })
  updateUserContent(
    @Param('userContentId') userContentId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateUserContentDto,
  ): Promise<void> {
    return this.contentService.updateUserContent(user.id, userContentId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('groups/:groupId/contents')
  @ApiOperation({ summary: '그룹 콘텐츠 목록 (투표 통계 포함)' })
  getGroupContents(@Param('groupId') groupId: string): Promise<GroupContentResponseDto[]> {
    return this.contentService.getGroupContents(groupId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('groups/:groupId/contents')
  @ApiOperation({ summary: '그룹 콘텐츠 추가' })
  addGroupContent(
    @Param('groupId') groupId: string,
    @Body() dto: AddGroupContentDto,
  ): Promise<GroupContentResponseDto> {
    return this.contentService.addGroupContent(groupId, dto.contentId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('groups/:groupId/contents/:gcId')
  @HttpCode(204)
  @ApiOperation({ summary: '그룹 콘텐츠 상태 수정' })
  updateGroupContentStatus(
    @Param('groupId') groupId: string,
    @Param('gcId') gcId: string,
    @Body() dto: UpdateGroupContentStatusDto,
  ): Promise<void> {
    return this.contentService.updateGroupContentStatus(groupId, gcId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('groups/:groupId/contents/vote')
  @HttpCode(200)
  @ApiOperation({ summary: '그룹 콘텐츠 투표 (중복 409)' })
  voteGroupContent(
    @Param('groupId') groupId: string,
    @CurrentUser() user: User,
    @Body() dto: VoteGroupContentDto,
  ): Promise<void> {
    return this.contentService.voteGroupContent(groupId, user.id, dto.groupContentId, dto.score);
  }
}
