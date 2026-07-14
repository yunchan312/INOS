import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// UptimeRobot 등 외부 모니터링용 경량 헬스체크 (인증 불필요)
@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: '헬스체크' })
  check(): { status: string } {
    return { status: 'ok' };
  }
}
