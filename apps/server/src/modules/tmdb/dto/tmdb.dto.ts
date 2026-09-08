import { ApiProperty } from '@nestjs/swagger';

export class TmdbMovieSearchItemResponseDto {
  @ApiProperty({ example: 933260 })
  tmdbId!: number;

  @ApiProperty({ example: '서브스턴스' })
  title!: string;

  @ApiProperty({ required: false, nullable: true, example: 'The Substance' })
  originalTitle!: string | null;

  @ApiProperty({ required: false, nullable: true, example: '코랄리 파르자' })
  director!: string | null;

  @ApiProperty({ required: false, nullable: true, example: 2024 })
  releaseYear!: number | null;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'TMDB 경로 조각. https://image.tmdb.org/t/p/{size} 뒤에 붙여 사용',
    example: '/lqoMzCcZYEFK729d6qzt349fB4o.jpg',
  })
  posterPath!: string | null;
}

export class MovieWorkResponseDto {
  @ApiProperty()
  tmdbId!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty({ required: false, nullable: true })
  originalTitle!: string | null;

  @ApiProperty({ required: false, nullable: true })
  director!: string | null;

  @ApiProperty({ required: false, nullable: true, example: '2024-09-07' })
  releaseDate!: string | null;

  @ApiProperty({ required: false, nullable: true, description: '분 단위' })
  runtime!: number | null;

  @ApiProperty({ required: false, nullable: true })
  overview!: string | null;

  @ApiProperty({ type: [String] })
  genres!: string[];

  @ApiProperty({ required: false, nullable: true })
  posterPath!: string | null;

  @ApiProperty({ required: false, nullable: true })
  backdropPath!: string | null;

  @ApiProperty({ required: false, nullable: true, example: '15' })
  certification!: string | null;
}
