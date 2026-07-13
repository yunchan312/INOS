import { ApiProperty } from '@nestjs/swagger';
import { GroupRole } from '@prisma/client';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateGroupSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  name?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  greeting?: string | null;
}

export class GroupSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  description!: string | null;

  @ApiProperty({ enum: ['OWNER', 'MEMBER'] })
  myRole!: GroupRole;

  @ApiProperty()
  memberCount!: number;

  @ApiProperty()
  createdAt!: Date;
}

export class GroupMemberDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  nickname!: string;

  @ApiProperty({ required: false, nullable: true })
  profileImageUrl!: string | null;

  @ApiProperty({ enum: ['OWNER', 'MEMBER'] })
  role!: GroupRole;

  @ApiProperty()
  joinedAt!: Date;
}

export class GroupDetailDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  description!: string | null;

  @ApiProperty({ required: false, nullable: true })
  greeting!: string | null;

  @ApiProperty()
  ownerId!: string;

  @ApiProperty({ enum: ['OWNER', 'MEMBER'] })
  myRole!: GroupRole;

  @ApiProperty({ type: [GroupMemberDto] })
  members!: GroupMemberDto[];

  @ApiProperty()
  createdAt!: Date;
}
