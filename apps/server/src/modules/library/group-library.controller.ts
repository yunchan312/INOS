import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PromptKind } from '@prisma/client';
import { LibraryService } from './library.service';
import { LibraryItemResponseDto, LibraryResponseDto, UpsertLibraryReviewDto } from './dto/library.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';

@ApiTags('library')
@Controller('groups/:groupId/library')
@UseGuards(JwtAuthGuard)
export class GroupLibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  @ApiOperation({ summary: '오가니제이션 라이브러리 조회 (멤버)' })
  getForGroup(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<LibraryResponseDto> {
    return this.libraryService.getForGroup(groupId, user.id);
  }

  @Put('reviews/:meetingId/:kind')
  @ApiOperation({ summary: '오가니제이션 리뷰 등록/수정 (멤버 누구나)' })
  upsertReview(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Param('meetingId', new ParseUUIDPipe()) meetingId: string,
    @Param('kind', new ParseEnumPipe(PromptKind)) kind: PromptKind,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpsertLibraryReviewDto,
  ): Promise<LibraryItemResponseDto> {
    return this.libraryService.upsertGroupReview(groupId, meetingId, kind, user.id, dto);
  }

  @Delete('reviews/:meetingId/:kind')
  @HttpCode(204)
  @ApiOperation({ summary: '오가니제이션 리뷰 삭제 (멤버 누구나)' })
  deleteReview(
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
    @Param('meetingId', new ParseUUIDPipe()) meetingId: string,
    @Param('kind', new ParseEnumPipe(PromptKind)) kind: PromptKind,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    return this.libraryService.deleteGroupReview(groupId, meetingId, kind, user.id);
  }
}
