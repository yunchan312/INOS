import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { InvitationStatus } from '@prisma/client';

export class InviteMemberDto {
  @ApiProperty()
  @IsEmail()
  email!: string;
}

export class InvitationPreviewDto {
  @ApiProperty()
  groupId!: string;

  @ApiProperty()
  groupName!: string;

  @ApiProperty()
  inviterName!: string;

  @ApiProperty()
  inviteeEmail!: string;

  @ApiProperty({ enum: ['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'] })
  status!: InvitationStatus;

  @ApiProperty()
  expiresAt!: Date;
}

export class InvitationAcceptResponseDto {
  @ApiProperty()
  groupId!: string;
}
