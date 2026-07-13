import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { NotesGateway } from './notes.gateway';

class OrgEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type!: string;
}

// apps/server → ai-server 내부 이벤트 릴레이 (socket 브로드캐스트 허브)
@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly notesGateway: NotesGateway) {}

  @Post('orgs/:orgId')
  @HttpCode(202)
  @ApiOperation({ summary: '오가니제이션 변경 실시간 브로드캐스트 (서버-투-서버)' })
  notifyOrgEvent(
    @Param('orgId') orgId: string,
    @Body() dto: OrgEventDto,
  ): { accepted: boolean } {
    this.notesGateway.broadcastOrgEvent(orgId, dto.type);
    return { accepted: true };
  }
}
