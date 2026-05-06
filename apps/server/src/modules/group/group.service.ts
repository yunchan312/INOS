import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateGroupDto,
  UpdateGroupDto,
  GroupResponseDto,
  GroupMemberResponseDto,
} from './dto/group.dto';

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async create(userId: string, dto: CreateGroupDto): Promise<GroupResponseDto> {
    return this.prisma.group.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId: userId,
        members: {
          create: { userId, role: 'LEADER' },
        },
      },
      select: this.groupSelect(),
    });
  }

  async findAll(userId: string): Promise<GroupResponseDto[]> {
    const memberships = await this.prisma.groupMember.findMany({
      where: { userId },
      select: { groupId: true },
    });
    const groupIds = memberships.map((m) => m.groupId);
    return this.prisma.group.findMany({
      where: { id: { in: groupIds } },
      select: this.groupSelect(),
    });
  }

  async findOne(groupId: string, userId: string): Promise<GroupResponseDto> {
    await this.assertMember(groupId, userId);
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: this.groupSelect(),
    });
    if (!group) throw new NotFoundException('그룹을 찾을 수 없습니다');
    return group;
  }

  async update(groupId: string, userId: string, dto: UpdateGroupDto): Promise<GroupResponseDto> {
    await this.assertLeader(groupId, userId);
    return this.prisma.group.update({
      where: { id: groupId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
      select: this.groupSelect(),
    });
  }

  async remove(groupId: string, userId: string): Promise<void> {
    await this.assertLeader(groupId, userId);
    await this.prisma.group.delete({ where: { id: groupId } });
  }

  async join(userId: string, inviteCode: string): Promise<void> {
    const group = await this.prisma.group.findFirst({ where: { inviteCode } });
    if (!group) throw new NotFoundException('유효하지 않은 초대 코드입니다');

    const existing = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId } },
    });
    if (existing) throw new ConflictException('이미 그룹 멤버입니다');

    await this.prisma.groupMember.create({
      data: { groupId: group.id, userId, role: 'MEMBER' },
    });
  }

  async refreshInviteCode(groupId: string, userId: string): Promise<{ inviteCode: string }> {
    await this.assertLeader(groupId, userId);
    const newCode = randomUUID();
    const group = await this.prisma.group.update({
      where: { id: groupId },
      data: { inviteCode: newCode },
      select: { inviteCode: true },
    });
    return { inviteCode: group.inviteCode };
  }

  async getMembers(groupId: string, userId: string): Promise<GroupMemberResponseDto[]> {
    await this.assertMember(groupId, userId);
    return this.prisma.groupMember.findMany({
      where: { groupId },
      select: {
        userId: true,
        role: true,
        joinedAt: true,
        user: { select: { nickname: true, profileImageUrl: true } },
      },
    });
  }

  async inviteMember(groupId: string, requesterId: string, targetUserId: string): Promise<void> {
    await this.assertLeader(groupId, requesterId);
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');

    await this.prisma.groupMember.upsert({
      where: { groupId_userId: { groupId, userId: targetUserId } },
      update: {},
      create: { groupId, userId: targetUserId, role: 'MEMBER' },
    });
  }

  async removeMember(groupId: string, requesterId: string, targetUserId: string): Promise<void> {
    await this.assertLeader(groupId, requesterId);
    await this.prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId: targetUserId } },
    });
  }

  async assertMember(groupId: string, userId: string): Promise<void> {
    const membership = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!membership) throw new ForbiddenException('그룹 멤버가 아닙니다');
  }

  async assertLeader(groupId: string, userId: string): Promise<void> {
    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!member || member.role !== 'LEADER') throw new ForbiddenException('그룹 리더만 가능합니다');
  }

  private triggerGroupEmbeddingUpdate(groupId: string): void {
    const aiUrl = this.config.get<string>('AI_SERVER_URL', 'http://localhost:3001');
    void axios
      .post(`${aiUrl}/api/embed/group/${groupId}`)
      .catch((err: unknown) =>
        this.logger.warn(`그룹 임베딩 갱신 실패: groupId=${groupId}`, err),
      );
  }

  private groupSelect() {
    return {
      id: true,
      name: true,
      description: true,
      ownerId: true,
      inviteCode: true,
      createdAt: true,
    } as const;
  }
}
