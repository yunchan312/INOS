import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsNumber,
  IsIn,
  MaxLength,
  Min,
} from 'class-validator';

export class UpsertNoteDto {
  @IsString()
  @IsIn(['BOOK', 'MOVIE'])
  promptKind!: string;

  @IsNumber()
  @Min(0)
  questionIndex!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;

  @IsBoolean()
  isPublic!: boolean;
}

export class TokenQueryDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class CreateCustomPromptDto {
  @IsString()
  @IsIn(['BOOK', 'MOVIE'])
  promptKind!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content!: string;
}

