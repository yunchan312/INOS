import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Headers,
  Sse,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { DiscussionService } from './discussion.service';
import { NotesGateway } from './notes.gateway';
import { UpsertNoteDto, TokenQueryDto } from './dto/discussion.dto';
import { JwtValidatorService } from '../../shared/auth/jwt-validator.service';
import type { DiscussionDto, DiscussionNoteDto } from '@inos/types';

@ApiTags('discussions')
@Controller('discussions')
export class DiscussionController {
  constructor(
    private readonly discussionService: DiscussionService,
    private readonly notesGateway: NotesGateway,
    private readonly jwtValidator: JwtValidatorService,
  ) {}

  @Post(':meetingId/generate')
  @ApiOperation({ summary: '발제문 생성 (서버-투-서버, 완료까지 동기 대기)' })
  // 생성이 끝난 뒤 응답 → 실패 시 호출한 BullMQ 잡이 실제로 재시도할 수 있음
  async triggerGenerate(
    @Param('meetingId') meetingId: string,
  ): Promise<{ generated: boolean }> {
    await this.discussionService.generate(meetingId);
    return { generated: true };
  }

  @Post(':meetingId/events/finished')
  @HttpCode(202)
  @ApiOperation({ summary: '모임 종료 실시간 브로드캐스트 (서버-투-서버)' })
  notifyFinished(@Param('meetingId') meetingId: string): { accepted: boolean } {
    this.notesGateway.broadcastMeetingFinished(meetingId);
    return { accepted: true };
  }

  @Sse('stream/:meetingId')
  @ApiOperation({ summary: '발제문 생성 SSE 스트리밍 (브라우저)' })
  streamGenerate(
    @Param('meetingId') meetingId: string,
    @Query() query: TokenQueryDto,
  ): Observable<MessageEvent> {
    try {
      this.jwtValidator.validate(query.token);
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }
    return this.discussionService.streamGenerate(meetingId);
  }

  @Get(':meetingId')
  @ApiOperation({ summary: '발제문 조회' })
  async findByMeetingId(
    @Param('meetingId') meetingId: string,
    @Headers('authorization') authHeader?: string,
  ): Promise<DiscussionDto> {
    this.requireAuth(authHeader);
    return this.discussionService.findByMeetingId(meetingId);
  }

  @Post(':meetingId/notes')
  @ApiOperation({ summary: '노트 추가/수정 (upsert)' })
  async upsertNote(
    @Param('meetingId') meetingId: string,
    @Body() dto: UpsertNoteDto,
    @Headers('authorization') authHeader?: string,
  ): Promise<DiscussionNoteDto> {
    const payload = this.requireAuth(authHeader);
    const note = await this.discussionService.upsertNote(meetingId, payload.sub, dto);
    this.notesGateway.broadcastNote(meetingId, note);
    return note;
  }

  @Get(':meetingId/notes')
  @ApiOperation({ summary: '발제문 노트 목록 조회' })
  async listNotes(
    @Param('meetingId') meetingId: string,
    @Headers('authorization') authHeader?: string,
  ): Promise<DiscussionNoteDto[]> {
    const payload = this.requireAuth(authHeader);
    return this.discussionService.listNotes(meetingId, payload.sub);
  }

  private requireAuth(authHeader?: string) {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('인증이 필요합니다');
    }
    return this.jwtValidator.validate(authHeader.slice(7));
  }
}
