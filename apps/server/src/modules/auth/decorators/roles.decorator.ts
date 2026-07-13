import { SetMetadata } from '@nestjs/common';
import { GroupRole } from '@prisma/client';

export const ROLES_METADATA_KEY = 'group_roles';

export const Roles = (...roles: GroupRole[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_METADATA_KEY, roles);
