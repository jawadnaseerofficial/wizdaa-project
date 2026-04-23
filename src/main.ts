import { ValidationPipe, Logger, RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { PrismaService } from './prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3000);
  const apiPrefix = config.get<string>('API_PREFIX', '/api/v1');

  app.use(helmet());
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.setGlobalPrefix(apiPrefix, {
    exclude: [{ path: '', method: RequestMethod.GET }],
  });

  const httpAdapter = app.getHttpAdapter().getInstance();
  httpAdapter.get('/', (_req: any, res: any) => {
    res.status(200).json({
      success: true,
      message: 'Time-Off Microservice is running',
      api: apiPrefix,
    });
  });

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}${apiPrefix}`);
  Logger.log(`Health check at: http://localhost:${port}${apiPrefix}/health`);
}

bootstrap();
