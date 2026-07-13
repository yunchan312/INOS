import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtValidatorService {
  private readonly jwtService: JwtService;

  constructor(private readonly config: ConfigService) {
    this.jwtService = new JwtService({
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }
  }
}
