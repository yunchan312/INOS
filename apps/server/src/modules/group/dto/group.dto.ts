import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateGroupDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class JoinGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  inviteCode!: string;
}

export class InviteMemberDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId!: string;
}

export interface GroupResponseDto {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  inviteCode: string;
  createdAt: Date;
}

export interface GroupMemberResponseDto {
  userId: string;
  role: string;
  joinedAt: Date;
  user: {
    nickname: string;
    profileImageUrl: string | null;
  };
}
