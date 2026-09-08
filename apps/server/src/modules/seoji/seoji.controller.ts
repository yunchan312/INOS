import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { SeojiBookSearchItemDto } from '@inos/types';
import { SeojiService } from './seoji.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('seoji')
@Controller('seoji')
@UseGuards(JwtAuthGuard)
export class SeojiController {
  constructor(private readonly seojiService: SeojiService) {}

  @Get('books/search')
  @ApiOperation({
    summary: '도서 제목 자동완성 (2글자 미만이면 빈 배열)',
  })
  searchBooks(@Query('q') q?: string): Promise<SeojiBookSearchItemDto[]> {
    return this.seojiService.search(q ?? '');
  }
}
