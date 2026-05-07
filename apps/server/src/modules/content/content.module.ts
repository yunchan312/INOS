import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { TmdbService } from './external/tmdb.service';
import { GoogleBooksService } from './external/google-books.service';

@Module({
  providers: [ContentService, TmdbService, GoogleBooksService],
  controllers: [ContentController],
  exports: [ContentService],
})
export class ContentModule {}
