import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { GroupModule } from './modules/group/group.module';
import { ContentModule } from './modules/content/content.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { ArchiveModule } from './modules/archive/archive.module';
import { DiscussionModule } from './modules/discussion/discussion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    GroupModule,
    ContentModule,
    ScheduleModule,
    DiscussionModule,
    ArchiveModule,
  ],
})
export class AppModule {}
