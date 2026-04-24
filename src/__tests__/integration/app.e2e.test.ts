import { Test } from '@nestjs/testing';
import { INestApplication, RequestMethod } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';

const prismaMock = {
  user: { findUnique: jest.fn() },
  timeOffBalance: { findUnique: jest.fn() },
  timeOffRequest: { findMany: jest.fn() },
  $transaction: jest.fn(),
};

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('/api/v1', { exclude: [{ path: '', method: RequestMethod.GET }] });

    const httpAdapter = app.getHttpAdapter().getInstance();
    httpAdapter.get('/', (_req: any, res: any) => {
      res.status(200).json({
        success: true,
        message: 'Time-Off Microservice is running',
        api: '/api/v1',
      });
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns root service status', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(({ body }: { body: any }) => {
        expect(body.success).toBe(true);
        expect(body.message).toContain('Time-Off Microservice is running');
        expect(body.api).toContain('/api/v1');
      });
  });

  it('returns health check success', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect(({ body }: { body: any }) => {
        expect(body.success).toBe(true);
        expect(body.message).toBe('Service is healthy');
      });
  });
});
