import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    // For Prisma 5.0.0+, beforeExit hook is not applicable to library engine
    // Use process event instead
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
