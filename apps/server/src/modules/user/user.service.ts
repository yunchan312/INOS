import { Injectable, NotFoundException } from '@nestjs/common';
import { OAuthProvider, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/user.dto';

export interface UpsertGoogleUserInput {
  googleId: string;
  email: string;
  name: string;
  picture: string | null;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async upsertFromGoogle(input: UpsertGoogleUserInput): Promise<User> {
    return this.prisma.user.upsert({
      where: {
        oauthProvider_oauthId: {
          oauthProvider: OAuthProvider.GOOGLE,
          oauthId: input.googleId,
        },
      },
      update: {
        email: input.email,
        nickname: input.name,
        profileImageUrl: input.picture,
      },
      create: {
        email: input.email,
        nickname: input.name,
        profileImageUrl: input.picture,
        oauthProvider: OAuthProvider.GOOGLE,
        oauthId: input.googleId,
      },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // 로컬(이메일/비밀번호) 가입 — unique(oauthProvider, oauthId) 충족을 위해 oauthId에 이메일 사용
  async createLocalUser(input: {
    email: string;
    passwordHash: string;
    nickname: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: input.email,
        nickname: input.nickname,
        oauthProvider: OAuthProvider.LOCAL,
        oauthId: input.email,
        passwordHash: input.passwordHash,
      },
    });
  }

  async update(userId: string, dto: UpdateUserDto): Promise<User> {
    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existing) throw new NotFoundException('사용자를 찾을 수 없습니다');
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        nickname: dto.nickname ?? existing.nickname,
        profileImageUrl: dto.profileImageUrl ?? existing.profileImageUrl,
      },
    });
  }
}
