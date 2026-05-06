import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Res,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GoogleProfile } from './strategies/google.strategy';

type FastifyReplyLike = {
  setCookie(name: string, value: string, opts: Record<string, unknown>): FastifyReplyLike;
  clearCookie(name: string, opts?: Record<string, unknown>): FastifyReplyLike;
  redirect(url: string): void;
  send(payload: unknown): void;
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth 로그인 시작' })
  googleLogin(): void {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth 콜백' })
  async googleCallback(
    @Req() req: { user: GoogleProfile },
    @Res() res: FastifyReplyLike,
  ): Promise<void> {
    const { accessToken, refreshToken, isNewUser } =
      await this.authService.handleGoogleCallback(req.user);

    res.setCookie('inos_refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    const base = process.env.VITE_API_URL ?? 'http://localhost:5173';
    res.redirect(`${base}/auth/callback?token=${accessToken}&isNew=${String(isNewUser)}`);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: '액세스 토큰 갱신' })
  async refresh(
    @Req() req: { cookies: Record<string, string> },
  ): Promise<{ accessToken: string }> {
    const refreshToken = req.cookies['inos_refresh'] ?? '';
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: '로그아웃' })
  logout(@Res() res: FastifyReplyLike): void {
    res.clearCookie('inos_refresh', { path: '/' });
    res.send({ message: 'ok' });
  }
}
