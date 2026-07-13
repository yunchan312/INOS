import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOrgDto {
  @ApiProperty({ description: '오가니제이션 이름' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ required: false, description: '설명' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: '소유자 이메일 (가입된 유저여야 함)' })
  @IsEmail()
  ownerEmail!: string;
}

export class UpdateOrgDto {
  @ApiProperty({ required: false, description: '오가니제이션 이름' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ required: false, description: '설명' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class SetAdminDto {
  @ApiProperty({ description: '관리자 권한 부여 여부' })
  @IsBoolean()
  isAdmin!: boolean;
}

export class AdminUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  nickname!: string;

  @ApiProperty({ nullable: true })
  profileImageUrl!: string | null;

  @ApiProperty()
  isAdmin!: boolean;

  @ApiProperty()
  orgCount!: number;

  @ApiProperty()
  createdAt!: Date;
}

export class AdminOrgDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty()
  ownerId!: string;

  @ApiProperty()
  ownerEmail!: string;

  @ApiProperty()
  ownerNickname!: string;

  @ApiProperty()
  memberCount!: number;

  @ApiProperty()
  meetingCount!: number;

  @ApiProperty()
  createdAt!: Date;
}

export class PaginatedOrgsDto {
  @ApiProperty({ type: [AdminOrgDto] })
  items!: AdminOrgDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;
}

export class PaginatedUsersDto {
  @ApiProperty({ type: [AdminUserDto] })
  items!: AdminUserDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;
}

export class CreateOrgResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty()
  ownerId!: string;

  @ApiProperty()
  ownerEmail!: string;

  @ApiProperty()
  ownerNickname!: string;

  @ApiProperty()
  createdAt!: Date;
}
