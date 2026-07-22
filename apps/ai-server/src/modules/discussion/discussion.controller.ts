import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
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
import {
  CreateCustomPromptDto,
  TokenQueryDto,
  UpdateCustomPromptDto,
  UpsertImpressionDto,
  UpsertNoteDto,
} from './dto/discussion.dto';
import { JwtValidatorService } from '../../shared/auth/jwt-validator.service';
import type {
  DiscussionCustomPromptDto,
  DiscussionDto,
  DiscussionImpressionDto,
  DiscussionNoteDto,
} from '@inos/types';

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

  @Get(':meetingId/custom-prompts')
  @ApiOperation({ summary: '자체 발제 질문 목록' })
  async listCustomPrompts(
    @Param('meetingId') meetingId: string,
    @Headers('authorization') authHeader?: string,
  ): Promise<DiscussionCustomPromptDto[]> {
    this.requireAuth(authHeader);
    return this.discussionService.listCustomPrompts(meetingId);
  }

  @Post(':meetingId/custom-prompts')
  @ApiOperation({ summary: '자체 발제 질문 추가' })
  async addCustomPrompt(
    @Param('meetingId') meetingId: string,
    @Body() dto: CreateCustomPromptDto,
    @Headers('authorization') authHeader?: string,
  ): Promise<DiscussionCustomPromptDto> {
    const payload = this.requireAuth(authHeader);
    const prompt = await this.discussionService.addCustomPrompt(
      meetingId,
      payload.sub,
      dto,
    );
    this.notesGateway.broadcastCustomPrompt(meetingId, prompt);
    return prompt;
  }

  @Patch(':meetingId/custom-prompts/:promptId')
  @ApiOperation({ summary: '자체 발제 질문 수정 (발제자·리더)' })
  async updateCustomPrompt(
    @Param('meetingId') meetingId: string,
    @Param('promptId') promptId: string,
    @Body() dto: UpdateCustomPromptDto,
    @Headers('authorization') authHeader?: string,
  ): Promise<DiscussionCustomPromptDto> {
    const payload = this.requireAuth(authHeader);
    const prompt = await this.discussionService.updateCustomPrompt(
      meetingId,
      promptId,
      payload.sub,
      dto.content,
    );
    this.notesGateway.broadcastCustomPromptUpdated(meetingId, prompt);
    return prompt;
  }

  @Delete(':meetingId/custom-prompts/:promptId')
  @HttpCode(204)
  @ApiOperation({ summary: '자체 발제 질문 삭제 (발제자·리더)' })
  async deleteCustomPrompt(
    @Param('meetingId') meetingId: string,
    @Param('promptId') promptId: string,
    @Headers('authorization') authHeader?: string,
  ): Promise<void> {
    const payload = this.requireAuth(authHeader);
    await this.discussionService.deleteCustomPrompt(
      meetingId,
      promptId,
      payload.sub,
    );
    this.notesGateway.broadcastCustomPromptRemoved(meetingId, promptId);
  }

  @Get(':meetingId/impressions')
  @ApiOperation({ summary: '작품 감상 목록' })
  async listImpressions(
    @Param('meetingId') meetingId: string,
    @Headers('authorization') authHeader?: string,
  ): Promise<DiscussionImpressionDto[]> {
    this.requireAuth(authHeader);
    return this.discussionService.listImpressions(meetingId);
  }

  @Put(':meetingId/impression')
  @ApiOperation({ summary: '내 작품 감상 저장/수정 (본인만)' })
  async upsertImpression(
    @Param('meetingId') meetingId: string,
    @Body() dto: UpsertImpressionDto,
    @Headers('authorization') authHeader?: string,
  ): Promise<DiscussionImpressionDto> {
    const payload = this.requireAuth(authHeader);
    const impression = await this.discussionService.upsertImpression(
      meetingId,
      payload.sub,
      dto.content,
    );
    this.notesGateway.broadcastImpression(meetingId, {
      userId: payload.sub,
      impression,
    });
    return impression;
  }

  @Delete(':meetingId/impression')
  @HttpCode(204)
  @ApiOperation({ summary: '내 작품 감상 삭제 (본인만)' })
  async deleteImpression(
    @Param('meetingId') meetingId: string,
    @Headers('authorization') authHeader?: string,
  ): Promise<void> {
    const payload = this.requireAuth(authHeader);
    await this.discussionService.deleteImpression(meetingId, payload.sub);
    this.notesGateway.broadcastImpression(meetingId, {
      userId: payload.sub,
      impression: null,
    });
  }

  private requireAuth(authHeader?: string) {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('인증이 필요합니다');
    }
    return this.jwtValidator.validate(authHeader.slice(7));
  }
}
