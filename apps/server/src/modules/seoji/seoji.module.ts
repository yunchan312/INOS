import { Module } from '@nestjs/common';
import { SeojiService } from './seoji.service';
import { SeojiController } from './seoji.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SeojiController],
  providers: [SeojiService],
  exports: [SeojiService],
})
export class SeojiModule {}
