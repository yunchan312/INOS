import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profileImageUrl?: string;
}

export class UpdateTasteDto {
  @ApiPropertyOptional()
  @IsOptional()
  tasteProfile?: unknown;
}

export interface UserResponseDto {
  id: string;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  tasteProfile: unknown;
  createdAt: Date;
}
