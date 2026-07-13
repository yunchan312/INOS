import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GroupRole, InvitationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  GroupDetailDto,
  GroupMemberDto,
  GroupSummaryDto,
  UpdateGroupSettingsDto,
} from './dto/group.dto';
import {
  InvitationAcceptResponseDto,
  InvitationPreviewDto,
} from './dto/invitation.dto';

@Injectable()
export class GroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  async findMineForUser(userId: string): Promise<GroupSummaryDto[]> {
    const memberships = await this.prisma.groupMember.findMany({
      where: { userId },
      orderBy: { joinedAt: 'desc' },
      include: {
        group: { include: { _count: { select: { members: true } } } },
      },
    });

    return memberships.map((m) => ({
      id: m.group.id,
      name: m.group.name,
      description: m.group.description,
      myRole: m.role,
      memberCount: m.group._count.members,
      createdAt: m.group.createdAt,
    }));
  }

  async findDetailForUser(groupId: string, userId: string): Promise<GroupDetailDto> {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
          include: {
            user: {
              select: { id: true, nickname: true, profileImageUrl: true },
            },
          },
        },
      },
    });

    if (!group) throw new NotFoundException('그룹을 찾을 수 없습니다');

    const myMembership = group.members.find((m) => m.userId === userId);
    if (!myMembership) throw new ForbiddenException('그룹 멤버가 아닙니다');

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      greeting: group.greeting,
      ownerId: group.ownerId,
      myRole: myMembership.role,
      members: group.members.map((m) => this.toMemberDto(m)),
      createdAt: group.createdAt,
    };
  }

  async listMembers(groupId: string, userId: string): Promise<GroupMemberDto[]> {
    await this.assertMember(groupId, userId);
    const members = await this.prisma.groupMember.findMany({
      where: { groupId },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
      include: {
        user: { select: { id: true, nickname: true, profileImageUrl: true } },
      },
    });
    return members.map((m) => this.toMemberDto(m));
  }

  async updateSettings(
    groupId: string,
    dto: UpdateGroupSettingsDto,
  ): Promise<GroupDetailDto> {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('그룹을 찾을 수 없습니다');

    const updated = await this.prisma.group.update({
      where: { id: groupId },
      data: {
        name: dto.name ?? group.name,
        description: dto.description === undefined ? group.description : dto.description,
        greeting: dto.greeting === undefined ? group.greeting : dto.greeting,
      },
    });

    return this.findDetailForUser(updated.id, group.ownerId);
  }

  async removeMember(
    groupId: string,
    targetUserId: string,
    callerId: string,
  ): Promise<void> {
    if (targetUserId === callerId) {
      throw new BadRequestException('자기 자신은 제거할 수 없습니다');
    }
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('그룹을 찾을 수 없습니다');
    if (group.ownerId === targetUserId) {
      throw new BadRequestException('소유자는 제거할 수 없습니다');
    }
    await this.prisma.groupMember.deleteMany({
      where: { groupId, userId: targetUserId },
    });
  }

  async inviteMember(
    groupId: string,
    ownerUserId: string,
    email: string,
  ): Promise<InvitationPreviewDto> {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { owner: true },
    });
    if (!group) throw new NotFoundException('그룹을 찾을 수 없습니다');

    const normalizedEmail = email.trim().toLowerCase();

    const existingMember = await this.prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        groupMembers: { some: { groupId } },
      },
      select: { id: true },
    });
    if (existingMember) {
      throw new ConflictException('이미 그룹 멤버입니다');
    }

    const ttlDays = this.config.get<number>('INVITATION_TTL_DAYS', 7);
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
    const token = this.generateToken();

    const invitation = await this.prisma.invitation.upsert({
      where: { groupId_email: { groupId, email: normalizedEmail } },
      update: {
        token,
        status: InvitationStatus.PENDING,
        expiresAt,
        invitedById: ownerUserId,
        acceptedAt: null,
      },
      create: {
        groupId,
        email: normalizedEmail,
        token,
        invitedById: ownerUserId,
        expiresAt,
      },
    });

    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    const inviter = await this.prisma.user.findUnique({
      where: { id: ownerUserId },
      select: { nickname: true },
    });

    await this.mailService.sendMembershipInvite({
      toEmail: normalizedEmail,
      groupName: group.name,
      inviterName: inviter?.nickname ?? '관리자',
      greeting: group.greeting,
      acceptUrl: `${frontendUrl}/invitations/${token}`,
    });

    return {
      groupId: invitation.groupId,
      groupName: group.name,
      inviterName: inviter?.nickname ?? '관리자',
      inviteeEmail: invitation.email,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
    };
  }

  async getInvitationPreview(token: string): Promise<InvitationPreviewDto> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        group: { select: { id: true, name: true } },
        invitedBy: { select: { nickname: true } },
      },
    });
    if (!invitation) throw new NotFoundException('초대장을 찾을 수 없습니다');

    const status = this.resolveStatus(invitation.status, invitation.expiresAt);
    return {
      groupId: invitation.group.id,
      groupName: invitation.group.name,
      inviterName: invitation.invitedBy.nickname,
      inviteeEmail: invitation.email,
      status,
      expiresAt: invitation.expiresAt,
    };
  }

  async acceptInvitation(
    token: string,
    userId: string,
  ): Promise<InvitationAcceptResponseDto> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });
    if (!invitation) throw new NotFoundException('초대장을 찾을 수 없습니다');
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('이미 사용된 초대장입니다');
    }
    if (invitation.expiresAt < new Date()) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      throw new BadRequestException('만료된 초대장입니다');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다');
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new ForbiddenException(
        '초대받은 이메일과 로그인한 이메일이 달라요',
      );
    }

    await this.prisma.$transaction([
      this.prisma.groupMember.upsert({
        where: { groupId_userId: { groupId: invitation.groupId, userId } },
        update: {},
        create: {
          groupId: invitation.groupId,
          userId,
          role: GroupRole.MEMBER,
        },
      }),
      this.prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: InvitationStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      }),
    ]);

    return { groupId: invitation.groupId };
  }

  async assertMember(groupId: string, userId: string): Promise<GroupRole> {
    const membership = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
      select: { role: true },
    });
    if (!membership) throw new ForbiddenException('그룹 멤버가 아닙니다');
    return membership.role;
  }

  private generateToken(): string {
    return randomBytes(32).toString('base64url');
  }

  private resolveStatus(status: InvitationStatus, expiresAt: Date): InvitationStatus {
    if (status === InvitationStatus.PENDING && expiresAt < new Date()) {
      return InvitationStatus.EXPIRED;
    }
    return status;
  }

  private toMemberDto(
    m: Prisma.GroupMemberGetPayload<{
      include: { user: { select: { id: true; nickname: true; profileImageUrl: true } } };
    }>,
  ): GroupMemberDto {
    return {
      id: m.id,
      userId: m.userId,
      nickname: m.user.nickname,
      profileImageUrl: m.user.profileImageUrl,
      role: m.role,
      joinedAt: m.joinedAt,
    };
  }
}
