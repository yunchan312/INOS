import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { AuthModule } from '../auth/auth.module';
import { GroupModule } from '../group/group.module';

@Module({
  imports: [AuthModule, GroupModule],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
