import { ApiProperty } from '@nestjs/swagger';

export class SeojiBookSearchItemResponseDto {
  @ApiProperty({ description: '13자리 ISBN (EA_ISBN)', example: '9788936434120' })
  isbn13!: string;

  @ApiProperty({ example: '소년이 온다' })
  title!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'SEOJI 원문 그대로 — 역할어가 붙어 있을 수 있습니다',
    example: '한강 지음',
  })
  author!: string | null;

  @ApiProperty({ required: false, nullable: true, example: '창비' })
  publisher!: string | null;

  @ApiProperty({ required: false, nullable: true, example: 2014 })
  publishYear!: number | null;

  @ApiProperty({
    required: false,
    nullable: true,
    description: '표지 이미지 절대 URL (TMDB와 달리 조립이 필요 없습니다)',
  })
  coverUrl!: string | null;
}

export class BookWorkResponseDto {
  @ApiProperty({ example: '9788936434120' })
  isbn13!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    description: '세트 ISBN (전집의 낱권이면 값이 있습니다)',
  })
  setIsbn!: string | null;

  @ApiProperty()
  title!: string;

  @ApiProperty({ required: false, nullable: true })
  seriesTitle!: string | null;

  @ApiProperty({ required: false, nullable: true })
  author!: string | null;

  @ApiProperty({ required: false, nullable: true })
  publisher!: string | null;

  @ApiProperty({ required: false, nullable: true, example: '2014-05-19' })
  publishDate!: string | null;

  @ApiProperty({ required: false, nullable: true, description: '쪽수' })
  page!: number | null;

  @ApiProperty({ required: false, nullable: true, description: '한국십진분류' })
  kdc!: string | null;

  @ApiProperty({ required: false, nullable: true, description: 'KDC 대분류 주제명' })
  subject!: string | null;

  @ApiProperty({ required: false, nullable: true })
  coverUrl!: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    description: '책소개 원문 URL — 본문은 아직 가져오지 않습니다',
  })
  introductionUrl!: string | null;

  @ApiProperty({ required: false, nullable: true, description: '목차 원문 URL' })
  tocUrl!: string | null;
}
