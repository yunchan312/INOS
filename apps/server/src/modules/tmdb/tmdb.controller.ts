import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { TmdbMovieSearchItemDto } from '@inos/types';
import { TmdbService } from './tmdb.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('tmdb')
@Controller('tmdb')
@UseGuards(JwtAuthGuard)
export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) {}

  @Get('movies/search')
  @ApiOperation({
    summary: '영화 제목 자동완성 (2글자 미만이면 빈 배열)',
  })
  searchMovies(@Query('q') q?: string): Promise<TmdbMovieSearchItemDto[]> {
    return this.tmdbService.search(q ?? '');
  }
}
