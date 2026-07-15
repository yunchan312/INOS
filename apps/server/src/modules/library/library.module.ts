import { Module } from '@nestjs/common';
import { LibraryService } from './library.service';
import { LibraryController } from './library.controller';
import { GroupLibraryController } from './group-library.controller';
import { PublicLibraryController } from './public-library.controller';
import { AuthModule } from '../auth/auth.module';
import { GroupModule } from '../group/group.module';

@Module({
  imports: [AuthModule, GroupModule],
  controllers: [
    LibraryController,
    GroupLibraryController,
    PublicLibraryController,
  ],
  providers: [LibraryService],
})
export class LibraryModule {}
