import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PromptKind } from '@prisma/client';
import { LibraryService } from './library.service';
import {
  CreateManualLibraryEntryDto,
  LibraryItemResponseDto,
  LibraryResponseDto,
  LibraryShareResponseDto,
  UpdateManualLibraryEntryDto,
  UpsertLibraryReviewDto,
} from './dto/library.dto';
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

  @Get('share')
  @ApiOperation({ summary: '내 서가 공유 상태 조회' })
  getShareStatus(@CurrentUser() user: AuthUser): Promise<LibraryShareResponseDto> {
    return this.libraryService.getShareStatus(user.id);
  }

  @Put('share')
  @ApiOperation({ summary: '내 서가 공개(공유 링크 생성)' })
  enableShare(@CurrentUser() user: AuthUser): Promise<LibraryShareResponseDto> {
    return this.libraryService.enableShare(user.id);
  }

  @Delete('share')
  @ApiOperation({ summary: '내 서가 비공개 전환' })
  disableShare(@CurrentUser() user: AuthUser): Promise<LibraryShareResponseDto> {
    return this.libraryService.disableShare(user.id);
  }

  @Post('manual')
  @ApiOperation({ summary: '수기 항목 등록 (책/영화 + 발제문)' })
  createManualEntry(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateManualLibraryEntryDto,
  ): Promise<LibraryItemResponseDto> {
    return this.libraryService.createManualEntry(user.id, dto);
  }

  @Patch('manual/:entryId')
  @ApiOperation({ summary: '수기 항목 수정 (별점·한줄평 포함)' })
  updateManualEntry(
    @Param('entryId', new ParseUUIDPipe()) entryId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateManualLibraryEntryDto,
  ): Promise<LibraryItemResponseDto> {
    return this.libraryService.updateManualEntry(user.id, entryId, dto);
  }

  @Delete('manual/:entryId')
  @HttpCode(204)
  @ApiOperation({ summary: '수기 항목 삭제' })
  deleteManualEntry(
    @Param('entryId', new ParseUUIDPipe()) entryId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    return this.libraryService.deleteManualEntry(user.id, entryId);
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
