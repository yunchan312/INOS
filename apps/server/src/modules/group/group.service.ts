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
  GroupInvitationDto,
  InvitationAcceptResponseDto,
  InvitationPreviewDto,
} from './dto/invitation.dto';
import type {
  GroupInviteLinkDto,
  InviteLinkAcceptResponseDto,
  InviteLinkPreviewDto,
} from '@inos/types';

/** 초대장에 보여줄 멤버 이름 수 — 넘치면 "외 N명"으로 */
const INVITE_PREVIEW_MEMBER_LIMIT = 12;

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

  /**
   * 이메일 초대 = 그룹의 초대 링크를 메일로 전달한다.
   * 링크가 하나뿐이라 수락 경로도 하나(`/invite/:token`)이고, 받는 사람의 이메일 일치는 보지 않는다.
   * 활성 링크가 없으면(만료·끄기) 새로 발급한다.
   */
  async inviteMember(
    groupId: string,
    ownerUserId: string,
    email: string,
  ): Promise<InvitationPreviewDto> {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('그룹을 찾을 수 없습니다');

    const normalizedEmail = email.trim().toLowerCase();

    const existingMember = await this.prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' },
        groupMembers: { some: { groupId } },
      },
      select: { id: true },
    });
    if (existingMember) {
      throw new ConflictException('이미 그룹 멤버입니다');
    }

    const link = await this.ensureActiveInviteLink(groupId, ownerUserId);
    const inviter = await this.prisma.user.findUnique({
      where: { id: ownerUserId },
      select: { nickname: true },
    });
    const inviterName = inviter?.nickname ?? '관리자';

    // 메일부터 보낸다 — 실패하면 "보냈다"는 기록을 남기지 않는다
    await this.mailService.sendMembershipInvite({
      toEmail: normalizedEmail,
      groupName: group.name,
      inviterName,
      greeting: group.greeting,
      acceptUrl: this.inviteLinkUrl(link.token),
      expiresAt: link.expiresAt,
    });

    // 누구에게 보냈는지의 기록 — 링크로 가입하면 ACCEPTED로 바뀐다.
    // token 컬럼은 링크 통합 이전에 나간 메일(`/invitations/:token`)과의 호환용이라 새로 쓰이지 않는다
    const invitation = await this.prisma.invitation.upsert({
      where: { groupId_email: { groupId, email: normalizedEmail } },
      update: {
        token: this.generateToken(),
        status: InvitationStatus.PENDING,
        expiresAt: link.expiresAt,
        invitedById: ownerUserId,
        acceptedAt: null,
      },
      create: {
        groupId,
        email: normalizedEmail,
        token: this.generateToken(),
        invitedById: ownerUserId,
        expiresAt: link.expiresAt,
      },
    });

    return {
      groupId: invitation.groupId,
      groupName: group.name,
      inviterName,
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

  async listPendingInvitations(groupId: string): Promise<GroupInvitationDto[]> {
    const invitations = await this.prisma.invitation.findMany({
      where: { groupId, status: InvitationStatus.PENDING },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        status: true,
        expiresAt: true,
        createdAt: true,
      },
    });
    return invitations;
  }

  async revokeInvitation(groupId: string, invitationId: string): Promise<void> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
      select: { id: true, groupId: true, status: true },
    });
    if (!invitation || invitation.groupId !== groupId) {
      throw new NotFoundException('초대를 찾을 수 없습니다');
    }
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('대기 중인 초대만 취소할 수 있어요');
    }
    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.REVOKED },
    });
  }

  async assertMember(groupId: string, userId: string): Promise<GroupRole> {
    const membership = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
      select: { role: true },
    });
    if (!membership) throw new ForbiddenException('그룹 멤버가 아닙니다');
    return membership.role;
  }

  // ─── 링크 초대 — 그룹당 활성 링크 1개, 링크를 아는 로그인 사용자는 누구나 참여 ───

  async createInviteLink(
    groupId: string,
    ownerUserId: string,
  ): Promise<GroupInviteLinkDto> {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('그룹을 찾을 수 없습니다');

    return this.toInviteLinkDto(await this.issueInviteLink(groupId, ownerUserId));
  }

  async getActiveInviteLink(groupId: string): Promise<GroupInviteLinkDto | null> {
    const link = await this.prisma.groupInviteLink.findFirst({
      where: { groupId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    return link ? this.toInviteLinkDto(link) : null;
  }

  async revokeInviteLink(groupId: string): Promise<void> {
    await this.prisma.groupInviteLink.updateMany({
      where: { groupId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async getInviteLinkPreview(token: string): Promise<InviteLinkPreviewDto> {
    const link = await this.prisma.groupInviteLink.findUnique({
      where: { token },
      include: {
        group: {
          select: {
            name: true,
            description: true,
            greeting: true,
            _count: { select: { members: true } },
            members: {
              select: { user: { select: { nickname: true } } },
              orderBy: { joinedAt: 'asc' },
              take: INVITE_PREVIEW_MEMBER_LIMIT,
            },
          },
        },
        createdBy: { select: { nickname: true } },
      },
    });
    if (!link) throw new NotFoundException('초대 링크를 찾을 수 없습니다');

    const expired = !!link.revokedAt || link.expiresAt < new Date();
    // 링크는 비로그인에게도 열려 있다 — 죽은 링크로는 모임 안쪽 정보를 보여주지 않는다
    return {
      groupName: link.group.name,
      inviterName: link.createdBy.nickname,
      memberCount: link.group._count.members,
      memberNames: expired ? [] : link.group.members.map((m) => m.user.nickname),
      greeting: expired ? null : link.group.greeting,
      description: expired ? null : link.group.description,
      expired,
    };
  }

  async acceptInviteLink(
    token: string,
    userId: string,
  ): Promise<InviteLinkAcceptResponseDto> {
    const link = await this.prisma.groupInviteLink.findUnique({
      where: { token },
    });
    if (!link) throw new NotFoundException('초대 링크를 찾을 수 없습니다');
    if (link.revokedAt || link.expiresAt < new Date()) {
      throw new BadRequestException('만료되거나 철회된 초대 링크예요');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다');

    // 수신자를 특정하지 않는 링크라 이메일 일치는 보지 않는다.
    // 대신 이 이메일로 보낸 초대 메일이 있었다면 함께 수락 처리해 "대기 중" 목록에서 내린다
    await this.prisma.$transaction([
      this.prisma.groupMember.upsert({
        where: { groupId_userId: { groupId: link.groupId, userId } },
        update: {},
        create: { groupId: link.groupId, userId, role: GroupRole.MEMBER },
      }),
      this.prisma.groupInviteLink.update({
        where: { id: link.id },
        data: { useCount: { increment: 1 } },
      }),
      this.prisma.invitation.updateMany({
        where: {
          groupId: link.groupId,
          email: { equals: user.email, mode: 'insensitive' },
          status: InvitationStatus.PENDING,
        },
        data: { status: InvitationStatus.ACCEPTED, acceptedAt: new Date() },
      }),
    ]);

    return { groupId: link.groupId };
  }

  /** 새 링크를 발급한다. 기존 활성 링크는 철회 — 언제나 최신 링크 하나만 유효 */
  private async issueInviteLink(groupId: string, createdById: string) {
    const ttlDays = this.config.get<number>('INVITATION_TTL_DAYS', 7);
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    const [, link] = await this.prisma.$transaction([
      this.prisma.groupInviteLink.updateMany({
        where: { groupId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      this.prisma.groupInviteLink.create({
        data: { groupId, token: this.generateToken(), createdById, expiresAt },
      }),
    ]);
    return link;
  }

  /** 살아 있는 링크가 있으면 그대로, 없으면 새로 발급 */
  private async ensureActiveInviteLink(groupId: string, createdById: string) {
    const active = await this.prisma.groupInviteLink.findFirst({
      where: { groupId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    return active ?? this.issueInviteLink(groupId, createdById);
  }

  private inviteLinkUrl(token: string): string {
    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    return `${frontendUrl}/invite/${token}`;
  }

  private toInviteLinkDto(link: {
    token: string;
    expiresAt: Date;
    useCount: number;
    createdAt: Date;
  }): GroupInviteLinkDto {
    return {
      url: this.inviteLinkUrl(link.token),
      token: link.token,
      expiresAt: link.expiresAt.toISOString(),
      useCount: link.useCount,
      createdAt: link.createdAt.toISOString(),
    };
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
