import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TimeOffService } from './time-off.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthRequest } from '../auth/types/auth-request.type';

@Controller('time-off')
@UseGuards(JwtAuthGuard)
export class TimeOffController {
  constructor(private readonly timeOffService: TimeOffService) {}

  @Post('requests')
  createRequest(@Req() req: AuthRequest, @Body() dto: CreateRequestDto) {
    return this.timeOffService.createRequest(req.user.sub, dto);
  }

  @Get('requests')
  getRequests(@Req() req: AuthRequest) {
    return this.timeOffService.getRequests(req.user.sub);
  }

  @Get('balance')
  getBalances(@Req() req: AuthRequest) {
    return this.timeOffService.getBalances(req.user.sub);
  }

  @Put('requests/:id/approve')
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  approveRequest(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.timeOffService.approveRequest(id, req.user.sub);
  }

  @Put('requests/:id/reject')
  @UseGuards(RolesGuard)
  @Roles('MANAGER', 'ADMIN')
  rejectRequest(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.timeOffService.rejectRequest(id, req.user.sub);
  }

  @Put('requests/:id/cancel')
  cancelRequest(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.timeOffService.cancelRequest(id, req.user.sub);
  }
}
