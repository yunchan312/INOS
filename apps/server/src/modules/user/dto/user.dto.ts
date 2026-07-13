import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  nickname?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;
}

export class UserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  nickname!: string;

  @ApiProperty({ required: false, nullable: true })
  profileImageUrl!: string | null;

  @ApiProperty()
  createdAt!: Date;
}
