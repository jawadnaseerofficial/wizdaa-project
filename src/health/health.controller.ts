import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return {
      success: true,
      message: 'Service is healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
