import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { HcmService } from './hcm.service';
import { HcmController } from './hcm.controller';

@Module({
  imports: [PrismaModule],
  providers: [HcmService],
  controllers: [HcmController],
})
export class HcmModule {}
