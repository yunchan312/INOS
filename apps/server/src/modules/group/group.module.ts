import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { InvitationController } from './invitation.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [GroupService],
  controllers: [GroupController, InvitationController],
  exports: [GroupService],
})
export class GroupModule {}
