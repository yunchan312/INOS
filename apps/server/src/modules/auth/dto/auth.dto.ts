import { ApiProperty } from '@nestjs/swagger';

export interface GoogleProfilePayload {
  googleId: string;
  email: string;
  name: string;
  picture: string | null;
}

export class MeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  nickname!: string;

  @ApiProperty({ required: false, nullable: true })
  profileImageUrl?: string | null;

  @ApiProperty()
  isAdmin!: boolean;

  @ApiProperty()
  createdAt!: Date;
}
