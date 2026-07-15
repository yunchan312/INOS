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
@Controller('users/me/library')
@UseGuards(JwtAuthGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  @ApiOperation({ summary: '내 개인 라이브러리 조회' })
  getMine(@CurrentUser() user: AuthUser): Promise<LibraryResponseDto> {
    return this.libraryService.getMine(user.id);
  }

  @Put('reviews/:meetingId/:kind')
  @ApiOperation({ summary: '개인 리뷰(별점·한줄평) 등록/수정' })
  upsertReview(
    @Param('meetingId', new ParseUUIDPipe()) meetingId: string,
    @Param('kind', new ParseEnumPipe(PromptKind)) kind: PromptKind,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpsertLibraryReviewDto,
  ): Promise<LibraryItemResponseDto> {
    return this.libraryService.upsertPersonalReview(user.id, meetingId, kind, dto);
  }

  @Delete('reviews/:meetingId/:kind')
  @HttpCode(204)
  @ApiOperation({ summary: '개인 리뷰 삭제' })
  deleteReview(
    @Param('meetingId', new ParseUUIDPipe()) meetingId: string,
    @Param('kind', new ParseEnumPipe(PromptKind)) kind: PromptKind,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    return this.libraryService.deletePersonalReview(user.id, meetingId, kind);
  }
}
