import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { HcmService } from './hcm.service';

@Controller('hcm')
export class HcmController {
  constructor(private readonly hcmService: HcmService) {}

  @Get('realtime')
  getRealtimeBalance(
    @Query('employeeId') employeeId: string,
    @Query('locationId') locationId: string,
    @Query('year') year: string,
  ) {
    return this.hcmService.getRealtimeBalance(employeeId, locationId, Number(year));
  }

  @Post('batch-sync')
  batchSync(@Body() payload: Array<{ employeeId: string; locationId: string; year: number; availableDays: number }>) {
    return this.hcmService.batchSync(payload);
  }
}
