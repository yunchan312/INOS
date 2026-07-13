import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UserService } from '../../user/user.service';

// passport-oauth2 기본 SessionStateStore는 req.session 이 없으면 에러.
// 세션 없이 동작하는 패스스루 구현으로 교체.
const noopStateStore = {
  store(
    _req: unknown,
    _state: string,
    _meta: unknown,
    cb: (err: Error | null, state?: string) => void,
  ): void {
    cb(null, 'noop');
  },
  verify(
    _req: unknown,
    _providedState: string,
    cb: (err: Error | null, ok?: boolean, state?: unknown) => void,
  ): void {
    cb(null, true, {});
  },
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      store: noopStateStore as any,
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      done(new Error('Google 계정에서 이메일을 가져올 수 없습니다'), undefined);
      return;
    }

    const user = await this.userService.upsertFromGoogle({
      googleId: profile.id,
      email,
      name: profile.displayName || email.split('@')[0],
      picture: profile.photos?.[0]?.value ?? null,
    });

    done(null, {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileImageUrl: user.profileImageUrl,
    });
  }
}
