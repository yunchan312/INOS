import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  issueAccessToken(userId: string): string {
    return this.jwt.sign(
      { sub: userId },
      {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '60m'),
      },
    );
  }

  issueRefreshToken(userId: string): string {
    return this.jwt.sign(
      { sub: userId, typ: 'refresh' },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    );
  }

  /** 리프레시 토큰 검증 → userId 반환. 만료/위조/타입 불일치면 401 */
  verifyRefreshToken(token: string): string {
    try {
      const payload = this.jwt.verify<{ sub: string; typ?: string }>(token, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      if (payload.typ !== 'refresh' || !payload.sub) {
        throw new Error('invalid refresh token');
      }
      return payload.sub;
    } catch {
      throw new UnauthorizedException('세션이 만료됐어요. 다시 로그인해주세요.');
    }
  }
}
