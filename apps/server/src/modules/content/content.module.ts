import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { TmdbService } from './external/tmdb.service';
import { KakaoBookService } from './external/kakao-book.service';

@Module({
  providers: [ContentService, TmdbService, KakaoBookService],
  controllers: [ContentController],
  exports: [ContentService],
})
export class ContentModule {}
