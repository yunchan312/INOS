import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  Redirect,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { compare, hash } from 'bcryptjs';
import axios from 'axios';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from './decorators/current-user.decorator';
import { MeResponseDto } from './dto/auth.dto';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import {
  decodeDesktopOauthState,
  encodeDesktopOauthState,
} from './desktop-oauth-state';

class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

class LocalSignupBody {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nickname!: string;
}

class LocalLoginBody {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

class RequestOrgDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  orgName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

interface GoogleTokenResponse {
  access_token: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  @Get('google')
  @Redirect()
  @ApiOperation({ summary: 'Google OAuth 진입 (데스크톱 앱은 desktop_port+nonce 전달)' })
  googleRedirect(
    @Query('desktop_port') desktopPort?: string,
    @Query('nonce') nonce?: string,
  ): { url: string; statusCode: number } {
    const params = new URLSearchParams({
      client_id: this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      redirect_uri: this.config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
    });

    if (desktopPort !== undefined || nonce !== undefined) {
      const state = encodeDesktopOauthState(desktopPort ?? '', nonce ?? '');
      if (!state) {
        throw new BadRequestException(
          'desktop_port 또는 nonce 파라미터가 올바르지 않습니다',
        );
      }
      params.set('state', state);
    }

    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      statusCode: 302,
    };
  }

  @Get('google/callback')
  @Redirect()
  @ApiOperation({ summary: 'Google OAuth 콜백 → JWT 발급 후 프론트로 리다이렉트' })
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state?: string,
  ): Promise<{ url: string; statusCode: number }> {
    if (!code) {
      throw new BadRequestException('code 파라미터가 없습니다');
    }

    try {
      const tokenRes = await axios.post<GoogleTokenResponse>(
        'https://oauth2.googleapis.com/token',
        {
          code,
          client_id: this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
          client_secret: this.config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
          redirect_uri: this.config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
          grant_type: 'authorization_code',
        },
      );

      const { access_token } = tokenRes.data;

      const userInfoRes = await axios.get<GoogleUserInfo>(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${access_token}` } },
      );

      const { sub: googleId, email, name, picture } = userInfoRes.data;

      const user = await this.userService.upsertFromGoogle({
        googleId,
        email,
        name,
        picture: picture ?? null,
      });

      const token = this.authService.issueAccessToken(user.id);
      const refresh = this.authService.issueRefreshToken(user.id);

      const desktopState = decodeDesktopOauthState(state);
      if (desktopState) {
        const query = new URLSearchParams({
          token,
          refresh,
          nonce: desktopState.nonce,
        });
        return {
          url: `http://127.0.0.1:${desktopState.port}/auth/callback?${query.toString()}`,
          statusCode: 302,
        };
      }

      const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
      const webQuery = new URLSearchParams({ token, refresh });
      return {
        url: `${frontendUrl}/auth/callback?${webQuery.toString()}`,
        statusCode: 302,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new InternalServerErrorException(
          `Google OAuth 오류: ${error.message}`,
        );
      }
      throw error;
    }
  }

  @Post('signup')
  @ApiOperation({ summary: '로컬 회원가입 (이메일/비밀번호)' })
  async signup(
    @Body() dto: LocalSignupBody,
  ): Promise<{ token: string; refreshToken: string }> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.userService.findByEmail(email);
    if (existing) {
      throw new ConflictException(
        existing.passwordHash
          ? '이미 가입된 이메일이에요. 로그인해주세요.'
          : '구글로 가입된 이메일이에요. "Google 로 계속하기"를 이용해주세요.',
      );
    }

    const passwordHash = await hash(dto.password, 10);
    const user = await this.userService.createLocalUser({
      email,
      passwordHash,
      nickname: dto.nickname.trim(),
    });

    return {
      token: this.authService.issueAccessToken(user.id),
      refreshToken: this.authService.issueRefreshToken(user.id),
    };
  }

  @Post('login')
  @ApiOperation({ summary: '로컬 로그인 (이메일/비밀번호)' })
  async login(
    @Body() dto: LocalLoginBody,
  ): Promise<{ token: string; refreshToken: string }> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userService.findByEmail(email);
    // 계정 존재 여부가 드러나지 않도록 실패 사유는 동일 문구로
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않아요');
    }
    if (!user.passwordHash) {
      throw new UnauthorizedException(
        '구글로 가입된 계정이에요. "Google 로 계속하기"를 이용해주세요.',
      );
    }
    const matches = await compare(dto.password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않아요');
    }

    return {
      token: this.authService.issueAccessToken(user.id),
      refreshToken: this.authService.issueRefreshToken(user.id),
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: '리프레시 토큰으로 토큰 재발급 (리프레시도 회전)' })
  async refresh(
    @Body() dto: RefreshDto,
  ): Promise<{ token: string; refreshToken: string }> {
    const userId = this.authService.verifyRefreshToken(dto.refreshToken);
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다');
    }
    return {
      token: this.authService.issueAccessToken(user.id),
      refreshToken: this.authService.issueRefreshToken(user.id),
    };
  }

  @Post('request-org')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '오가니제이션 생성 신청 이메일 발송' })
  async requestOrg(
    @CurrentUser() user: AuthUser,
    @Body() dto: RequestOrgDto,
  ): Promise<{ success: boolean }> {
    await this.mailService.sendOrgRequest(user.email, dto.orgName, dto.message);
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '현재 로그인한 유저' })
  async me(@CurrentUser() user: AuthUser): Promise<MeResponseDto> {
    const record = await this.userService.findById(user.id);
    if (!record) throw new BadRequestException('사용자를 찾을 수 없습니다');
    return {
      id: record.id,
      email: record.email,
      nickname: record.nickname,
      profileImageUrl: record.profileImageUrl,
      isAdmin: record.isAdmin,
      createdAt: record.createdAt,
    };
  }
}
