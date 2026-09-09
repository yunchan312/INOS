import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ShowcaseDto } from '@inos/types';
import { ShowcaseService } from './showcase.service';

/** 로그인 전 랜딩에서 호출한다 — 의도적으로 가드를 걸지 않는 공개 엔드포인트 */
@ApiTags('showcase')
@Controller('showcase')
export class ShowcaseController {
  constructor(private readonly showcaseService: ShowcaseService) {}

  @Get()
  @ApiOperation({
    summary: '랜딩용 인기 영화 20편 (공개, 6시간 캐시)',
    description:
      'TMDB 키가 없거나 조회에 실패하면 빈 배열로 내려가고 화면이 자체 폴백을 쓴다. ' +
      '서가의 책은 랭킹 API가 없어 웹의 큐레이션 목록이 채운다',
  })
  get(): Promise<ShowcaseDto> {
    return this.showcaseService.get();
  }
}
