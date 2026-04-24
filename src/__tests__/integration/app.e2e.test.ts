import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
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
        expect(body.data.message).toBe('Service is healthy');
      });
  });
});
