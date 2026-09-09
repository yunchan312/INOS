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
    summary: '도서 자동완성 — 제목·저자·출판사 조합',
    description:
      '세 항목 모두 선택이지만 그중 하나는 2글자 이상이어야 한다. 같은 제목의 판본이 많아 저자·출판사로 좁힐 수 있다',
  })
  searchBooks(
    @Query('q') q?: string,
    @Query('author') author?: string,
    @Query('publisher') publisher?: string,
  ): Promise<SeojiBookSearchItemDto[]> {
    return this.seojiService.search({ title: q, author, publisher });
  }
}
