import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { DiscussionService } from './discussion.service';
import { UpsertNoteDto, DiscussionNoteResponseDto } from './dto/discussion.dto';

@ApiTags('discussions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('discussions')
export class DiscussionController {
  constructor(private readonly discussionService: DiscussionService) {}

  @Post(':discussionId/notes')
  @ApiOperation({ summary: '답변 작성/수정 (upsert, 공개 후 수정 불가)' })
  upsertNote(
    @Param('discussionId') discussionId: string,
    @CurrentUser() user: User,
    @Body() dto: UpsertNoteDto,
  ): Promise<DiscussionNoteResponseDto> {
    return this.discussionService.upsertNote(
      discussionId,
      user.id,
      dto.questionIndex,
      dto.content,
    );
  }

  @Get(':discussionId/notes')
  @ApiOperation({ summary: '답변 조회 (본인은 항상, 타인은 모임 후 공개 답변만)' })
  getNotes(
    @Param('discussionId') discussionId: string,
    @CurrentUser() user: User,
  ): Promise<DiscussionNoteResponseDto[]> {
    return this.discussionService.getNotes(discussionId, user.id);
  }

  @Patch(':discussionId/notes/:questionIndex/publish')
  @ApiOperation({ summary: '내 답변 공개 (모임 날짜 이후만)' })
  publishNote(
    @Param('discussionId') discussionId: string,
    @Param('questionIndex') questionIndex: string,
    @CurrentUser() user: User,
  ): Promise<DiscussionNoteResponseDto> {
    return this.discussionService.publishNote(
      discussionId,
      user.id,
      parseInt(questionIndex, 10),
    );
  }
}
