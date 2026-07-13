import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ClaudeModule } from './shared/claude/claude.module';
import { JwtValidatorModule } from './shared/auth/jwt-validator.module';
import { DiscussionModule } from './modules/discussion/discussion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    ClaudeModule,
    JwtValidatorModule,
    DiscussionModule,
  ],
})
export class AppModule {}
