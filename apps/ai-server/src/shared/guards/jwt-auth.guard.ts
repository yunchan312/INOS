import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from '@inos/types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: JwtPayload;
    }>();

    const token = this.extractToken(request.headers.authorization);
    if (!token) throw new UnauthorizedException('토큰이 없습니다');

    try {
      const payload = this.jwt.verify<JwtPayload>(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }
  }

  private extractToken(authorization?: string): string | null {
    if (!authorization?.startsWith('Bearer ')) return null;
    return authorization.substring(7);
  }
}
