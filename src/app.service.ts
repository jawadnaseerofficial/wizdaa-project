import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getOverview() {
    return {
      success: true,
      message: 'Time-Off Microservice API is available',
      health: '/health',
      auth: '/auth',
      timeOff: '/time-off',
      hcm: '/hcm',
    };
  }
}
