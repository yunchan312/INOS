import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGroupPostDto {
  @ApiProperty({ maxLength: 100, example: '이번 달 모임 소감' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title!: string;

  @ApiProperty({ description: '마크다운 원문', maxLength: 10000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content!: string;
}

export class UpdateGroupPostDto {
  @ApiProperty({ required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title?: string;

  @ApiProperty({ required: false, description: '마크다운 원문', maxLength: 10000 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content?: string;
}
