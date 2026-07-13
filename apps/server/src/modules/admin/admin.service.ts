import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GroupRole, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  AdminOrgDto,
  CreateOrgDto,
  CreateOrgResponseDto,
  PaginatedOrgsDto,
  PaginatedUsersDto,
  UpdateOrgDto,
} from './dto/admin.dto';

const PAGE_SIZE = 30;

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  async listOrgs(params: {
    search?: string;
    member?: string;
    minMembers?: number;
    page?: number;
  }): Promise<PaginatedOrgsDto> {
    const keyword = params.search?.trim();
    const memberKeyword = params.member?.trim();
    const where: Prisma.GroupWhereInput = {};

    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { owner: { email: { contains: keyword, mode: 'insensitive' } } },
        { owner: { nickname: { contains: keyword, mode: 'insensitive' } } },
      ];
    }

    // 특정 사용자가 멤버로 속한 오가니제이션만
    if (memberKeyword) {
      where.members = {
        some: {
          user: {
            OR: [
              { email: { contains: memberKeyword, mode: 'insensitive' } },
              { nickname: { contains: memberKeyword, mode: 'insensitive' } },
            ],
          },
        },
      };
    }

    // 멤버 N명 이상 — Prisma where는 관계 count를 지원하지 않아 groupBy로 id를 좁힌다
    if (params.minMembers && params.minMembers > 1) {
      const grouped = await this.prisma.groupMember.groupBy({
        by: ['groupId'],
        _count: { groupId: true },
        having: { groupId: { _count: { gte: params.minMembers } } },
      });
      where.id = { in: grouped.map((g) => g.groupId) };
    }

    const safePage = Math.max(1, params.page ?? 1);
    const [total, groups] = await this.prisma.$transaction([
      this.prisma.group.count({ where }),
      this.prisma.group.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          owner: { select: { email: true, nickname: true } },
          _count: { select: { members: true, meetings: true } },
        },
      }),
    ]);

    return {
      items: groups.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        ownerId: g.ownerId,
        ownerEmail: g.owner.email,
        ownerNickname: g.owner.nickname,
        memberCount: g._count.members,
        meetingCount: g._count.meetings,
        createdAt: g.createdAt,
      })),
      total,
      page: safePage,
      pageSize: PAGE_SIZE,
    };
  }

  async listUsers(params: {
    search?: string;
    joinedAfter?: string;
    adminOnly?: boolean;
    page?: number;
  }): Promise<PaginatedUsersDto> {
    const keyword = params.search?.trim();
    const where: Prisma.UserWhereInput = {};

    if (keyword) {
      where.OR = [
        { email: { contains: keyword, mode: 'insensitive' } },
        { nickname: { contains: keyword, mode: 'insensitive' } },
      ];
    }
    if (params.joinedAfter) {
      const after = new Date(`${params.joinedAfter.slice(0, 10)}T00:00:00.000Z`);
      if (!Number.isNaN(after.getTime())) {
        where.createdAt = { gte: after };
      }
    }
    if (params.adminOnly) {
      where.isAdmin = true;
    }

    const safePage = Math.max(1, params.page ?? 1);
    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { _count: { select: { groupMembers: true } } },
      }),
    ]);

    return {
      items: users.map((u) => ({
        id: u.id,
        email: u.email,
        nickname: u.nickname,
        profileImageUrl: u.profileImageUrl,
        isAdmin: u.isAdmin,
        orgCount: u._count.groupMembers,
        createdAt: u.createdAt,
      })),
      total,
      page: safePage,
      pageSize: PAGE_SIZE,
    };
  }

  async createOrg(dto: CreateOrgDto): Promise<CreateOrgResponseDto> {
    const ownerEmail = dto.ownerEmail.trim().toLowerCase();
    const owner = await this.prisma.user.findUnique({
      where: { email: ownerEmail },
    });
    if (!owner) {
      throw new NotFoundException(
        '해당 이메일로 가입된 유저가 없어요. 먼저 한 번 로그인해야 해요.',
      );
    }

    const group = await this.prisma.group.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        ownerId: owner.id,
        members: {
          create: { userId: owner.id, role: GroupRole.OWNER },
        },
      },
    });

    await this.notifyOwner(() =>
      this.mailService.sendOrgCreated({
        toEmail: owner.email,
        toName: owner.nickname,
        orgName: group.name,
        orgUrl: this.orgUrl(group.id),
      }),
    );

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      ownerId: owner.id,
      ownerEmail: owner.email,
      ownerNickname: owner.nickname,
      createdAt: group.createdAt,
    };
  }

  async updateOrg(orgId: string, dto: UpdateOrgDto): Promise<AdminOrgDto> {
    const group = await this.prisma.group.findUnique({
      where: { id: orgId },
      include: { owner: { select: { email: true, nickname: true } } },
    });
    if (!group) throw new NotFoundException('오가니제이션을 찾을 수 없어요');

    const changes: string[] = [];
    const newName = dto.name?.trim();
    if (newName !== undefined && newName !== group.name) {
      changes.push(`이름: 「${group.name}」 → 「${newName}」`);
    }
    if (
      dto.description !== undefined &&
      (dto.description.trim() || null) !== group.description
    ) {
      changes.push('설명이 변경됐어요');
    }

    const updated = await this.prisma.group.update({
      where: { id: orgId },
      data: {
        name: newName ?? group.name,
        description:
          dto.description === undefined
            ? group.description
            : dto.description.trim() || null,
      },
      include: {
        owner: { select: { email: true, nickname: true } },
        _count: { select: { members: true, meetings: true } },
      },
    });

    if (changes.length > 0) {
      await this.notifyOwner(() =>
        this.mailService.sendOrgUpdated({
          toEmail: updated.owner.email,
          toName: updated.owner.nickname,
          orgName: updated.name,
          orgUrl: this.orgUrl(updated.id),
          changes,
        }),
      );
    }

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      ownerId: updated.ownerId,
      ownerEmail: updated.owner.email,
      ownerNickname: updated.owner.nickname,
      memberCount: updated._count.members,
      meetingCount: updated._count.meetings,
      createdAt: updated.createdAt,
    };
  }

  async deleteOrg(orgId: string): Promise<void> {
    const group = await this.prisma.group.findUnique({
      where: { id: orgId },
      include: { owner: { select: { email: true, nickname: true } } },
    });
    if (!group) throw new NotFoundException('오가니제이션을 찾을 수 없어요');

    // Discussion.groupId FK에는 cascade가 없어 그룹 삭제 전에 직접 지운다
    await this.prisma.$transaction([
      this.prisma.discussion.deleteMany({ where: { groupId: orgId } }),
      this.prisma.group.delete({ where: { id: orgId } }),
    ]);

    await this.notifyOwner(() =>
      this.mailService.sendOrgDeleted({
        toEmail: group.owner.email,
        toName: group.owner.nickname,
        orgName: group.name,
      }),
    );
  }

  async setUserAdmin(
    userId: string,
    isAdmin: boolean,
    callerId: string,
  ): Promise<{ id: string; isAdmin: boolean }> {
    if (userId === callerId) {
      throw new BadRequestException('본인의 관리자 권한은 변경할 수 없어요');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없어요');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isAdmin },
    });
    return { id: updated.id, isAdmin: updated.isAdmin };
  }

  async deleteUser(userId: string, callerId: string): Promise<void> {
    if (userId === callerId) {
      throw new BadRequestException('본인 계정은 삭제할 수 없어요');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { _count: { select: { ownedGroups: true } } },
    });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없어요');
    if (user._count.ownedGroups > 0) {
      throw new BadRequestException(
        '소유한 오가니제이션이 있어 삭제할 수 없어요. 먼저 해당 오가니제이션을 삭제해주세요.',
      );
    }

    // FK restrict 관계 정리: 보낸 초대장은 삭제, 생성한 모임은 그룹 소유자에게 이관.
    // 멤버십/응답/노트는 스키마 cascade로 함께 삭제된다.
    await this.prisma.$transaction([
      this.prisma.invitation.deleteMany({ where: { invitedById: userId } }),
      this.prisma
        .$executeRaw`UPDATE meetings m SET "createdById" = g."ownerId" FROM groups g WHERE m."groupId" = g.id AND m."createdById" = ${userId}::uuid`,
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }

  private orgUrl(orgId: string): string {
    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    return `${frontendUrl}/orgs/${orgId}`;
  }

  private async notifyOwner(send: () => Promise<void>): Promise<void> {
    try {
      await send();
    } catch (error) {
      this.logger.error(
        `소유자 알림 메일 발송 실패: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}
