import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto, UpdateTasteDto, UserResponseDto } from './dto/user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async findById(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        profileImageUrl: true,
        tasteProfile: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');
    return user;
  }

  async update(userId: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.nickname !== undefined && { nickname: dto.nickname }),
        ...(dto.profileImageUrl !== undefined && { profileImageUrl: dto.profileImageUrl }),
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        profileImageUrl: true,
        tasteProfile: true,
        createdAt: true,
      },
    });
  }

  async updateTaste(userId: string, dto: UpdateTasteDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        tasteProfile:
          dto.tasteProfile === null || dto.tasteProfile === undefined
            ? Prisma.JsonNull
            : (dto.tasteProfile as Prisma.InputJsonValue),
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        profileImageUrl: true,
        tasteProfile: true,
        createdAt: true,
      },
    });

    const aiUrl = this.config.get<string>('AI_SERVER_URL', 'http://localhost:3001');
    void axios
      .post(`${aiUrl}/api/embed/user/${userId}`)
      .catch((err: unknown) => this.logger.warn(`임베딩 갱신 실패: userId=${userId}`, err));

    return updated;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');
    await this.prisma.user.delete({ where: { id: userId } });
  }
}
