import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtValidatorService } from './jwt-validator.service';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [JwtValidatorService],
  exports: [JwtValidatorService],
})
export class JwtValidatorModule {}
