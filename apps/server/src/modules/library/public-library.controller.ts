import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LibraryService } from './library.service';
import { SharedLibraryResponseDto } from './dto/library.dto';

// 공개 엔드포인트 — 인증 가드 없음. 공유 슬러그로만 접근 가능한 읽기전용 서가.
@ApiTags('library')
@Controller('library/shared')
export class PublicLibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get(':shareId')
  @ApiOperation({ summary: '공유된 서가 조회 (공개, 읽기전용)' })
  getShared(@Param('shareId') shareId: string): Promise<SharedLibraryResponseDto> {
    return this.libraryService.getBySharedId(shareId);
  }
}
