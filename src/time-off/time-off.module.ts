import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TimeOffService } from './time-off.service';
import { TimeOffController } from './time-off.controller';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [TimeOffController],
  providers: [TimeOffService, RolesGuard],
})
export class TimeOffModule {}
