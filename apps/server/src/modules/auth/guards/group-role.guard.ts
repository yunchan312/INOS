import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GroupRole } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ROLES_METADATA_KEY } from '../decorators/roles.decorator';
import { AuthUser } from '../decorators/current-user.decorator';

@Injectable()
export class GroupRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles =
      this.reflector.getAllAndOverride<GroupRole[] | undefined>(
        ROLES_METADATA_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? [];

    const request = context.switchToHttp().getRequest<{
      user?: AuthUser;
      params: Record<string, string>;
    }>();

    const user = request.user;
    if (!user) throw new ForbiddenException('인증이 필요합니다');

    const groupId = request.params.groupId ?? request.params.id;
    if (!groupId) throw new ForbiddenException('groupId 파라미터가 필요합니다');

    const membership = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: user.id } },
      select: { role: true },
    });

    if (!membership) throw new ForbiddenException('그룹 멤버가 아닙니다');

    if (requiredRoles.length > 0 && !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('해당 작업 권한이 없습니다');
    }

    return true;
  }
}
