import { IsString, IsNotEmpty, IsDateString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMeetingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  groupContentId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  confirmedDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateMeetingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  confirmedDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;
}

export class AvailabilityDto {
  @ApiProperty({ type: [String], description: 'ISO 날짜 배열' })
  @IsArray()
  @IsDateString({}, { each: true })
  availableDates!: string[];
}

export interface MeetingResponseDto {
  id: string;
  groupId: string;
  groupContentId: string;
  confirmedDate: Date | null;
  location: string | null;
  status: string;
  createdAt: Date;
}
