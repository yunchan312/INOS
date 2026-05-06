import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleProfile } from './strategies/google.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleGoogleCallback(profile: GoogleProfile): Promise<{
    accessToken: string;
    refreshToken: string;
    isNewUser: boolean;
  }> {
    let isNewUser = false;
    let user = await this.prisma.user.findUnique({
      where: { oauthProvider_oauthId: { oauthProvider: 'GOOGLE', oauthId: profile.oauthId } },
    });

    if (!user) {
      isNewUser = true;
      user = await this.prisma.user.create({
        data: {
          oauthProvider: 'GOOGLE',
          oauthId: profile.oauthId,
          email: profile.email,
          nickname: profile.nickname,
          profileImageUrl: profile.profileImageUrl,
        },
      });
    }

    const tokens = this.issueTokens(user.id, user.email);
    return { ...tokens, isNewUser };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    let payload: { sub: string; email: string };
    try {
      payload = this.jwt.verify<{ sub: string; email: string }>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('리프레시 토큰이 유효하지 않습니다');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException();

    const accessToken = this.jwt.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '15m' },
    );
    return { accessToken };
  }

  private issueTokens(
    userId: string,
    email: string,
  ): { accessToken: string; refreshToken: string } {
    const payload = { sub: userId, email };
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: '30d',
    });
    return { accessToken, refreshToken };
  }
}
