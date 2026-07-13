import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { DiscussionNoteDto } from '@inos/types';
import { JwtValidatorService } from '../../shared/auth/jwt-validator.service';

@WebSocketGateway({
  namespace: '/notes',
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  },
})
export class NotesGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtValidator: JwtValidatorService) {}

  handleConnection(client: Socket): void {
    try {
      const token = client.handshake.auth?.token as string | undefined;
      if (!token) throw new Error('no token');
      const payload = this.jwtValidator.validate(token);
      client.data.userId = payload.sub;
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, meetingId: string): void {
    if (typeof meetingId === 'string' && meetingId) {
      void client.join(`meeting:${meetingId}`);
    }
  }

  @SubscribeMessage('leave')
  handleLeave(client: Socket, meetingId: string): void {
    if (typeof meetingId === 'string' && meetingId) {
      void client.leave(`meeting:${meetingId}`);
    }
  }

  @SubscribeMessage('join-org')
  handleJoinOrg(client: Socket, orgId: string): void {
    if (typeof orgId === 'string' && orgId) {
      void client.join(`org:${orgId}`);
    }
  }

  @SubscribeMessage('leave-org')
  handleLeaveOrg(client: Socket, orgId: string): void {
    if (typeof orgId === 'string' && orgId) {
      void client.leave(`org:${orgId}`);
    }
  }

  // 모임 생성/수정/삭제/확정 등 오가니제이션 단위 변경 알림
  broadcastOrgEvent(orgId: string, type: string): void {
    this.server.to(`org:${orgId}`).emit('org-event', { orgId, type });
  }

  // 모임 종료 → 접속 중인 모든 멤버 UI를 즉시 read-only로 전환
  broadcastMeetingFinished(meetingId: string): void {
    this.server.to(`meeting:${meetingId}`).emit('meeting-finished', { meetingId });
  }

  // 공개 노트는 전체 브로드캐스트, 비공개 전환은 숨김 이벤트로 알림
  broadcastNote(meetingId: string, note: DiscussionNoteDto): void {
    const room = `meeting:${meetingId}`;
    if (note.isPublic) {
      this.server.to(room).emit('note-updated', note);
    } else {
      this.server.to(room).emit('note-hidden', {
        id: note.id,
        userId: note.userId,
        promptKind: note.promptKind,
        questionIndex: note.questionIndex,
      });
    }
  }
}
