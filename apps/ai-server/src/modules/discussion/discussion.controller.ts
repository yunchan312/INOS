import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import type { JwtPayload } from '@inos/types';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { DiscussionService } from './discussion.service';
import {
  UpdateDiscussionDto,
  AddDiscussionNoteDto,
  PersonalStreamQueryDto,
  DiscussionResponseDto,
  DiscussionNoteResponseDto,
} from './dto/discussion.dto';

@ApiTags('discussions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('discussions')
export class DiscussionController {
  constructor(private readonly discussionService: DiscussionService) {}

  @Sse('personal/stream')
  @ApiOperation({ summary: '개인 감상 질문 SSE 스트리밍' })
  streamPersonal(
    @Query() query: PersonalStreamQueryDto,
    @CurrentUser() user: JwtPayload,
  ): Observable<MessageEvent> {
    return this.discussionService.streamPersonal(query.contentId, user.sub);
  }

  @Sse('stream/:meetingId')
  @ApiOperation({ summary: '발제문 생성 SSE 스트리밍' })
  streamGenerate(@Param('meetingId') meetingId: string): Observable<MessageEvent> {
    return this.discussionService.streamGenerate(meetingId);
  }

  @Get(':id')
  @ApiOperation({ summary: '발제문 상세 조회' })
  async findById(@Param('id') id: string): Promise<DiscussionResponseDto> {
    return this.discussionService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '발제문 수정' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDiscussionDto,
  ): Promise<DiscussionResponseDto> {
    return this.discussionService.update(id, dto);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: '발제문 발행' })
  async publish(@Param('id') id: string): Promise<DiscussionResponseDto> {
    return this.discussionService.publish(id);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: '토론 노트 추가' })
  async addNote(
    @Param('id') discussionId: string,
    @Body() dto: AddDiscussionNoteDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<DiscussionNoteResponseDto> {
    return this.discussionService.addNote(discussionId, user.sub, dto);
  }
}
