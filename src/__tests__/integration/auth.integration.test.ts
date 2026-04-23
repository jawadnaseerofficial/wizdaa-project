import request from 'supertest';
import app from '../../index';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Auth Integration Tests', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash('TestPassword123', 10);

    const user = await prisma.user.create({
      data: {
        email: 'integration-test@example.com',
        password: hashedPassword,
        firstName: 'Integration',
        lastName: 'Test',
        role: UserRole.EMPLOYEE,
      },
    });

    testUserId = user.id;

    await prisma.timeOffBalance.create({
      data: {
        userId: user.id,
        totalDays: 20,
        usedDays: 0,
        pendingDays: 0,
        remainingDays: 20,
        year: new Date().getFullYear(),
      },
    });
  });

  afterAll(async () => {
    await prisma.timeOffRequest.deleteMany();
    await prisma.timeOffBalance.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'Password123',
          firstName: 'New',
          lastName: 'User',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('newuser@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('should return error for invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123',
          firstName: 'New',
          lastName: 'User',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return error for weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser2@example.com',
          password: 'weak',
          firstName: 'New',
          lastName: 'User',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return error for duplicate email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'integration-test@example.com',
          password: 'Password123',
          firstName: 'Integration',
          lastName: 'Test',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'integration-test@example.com',
          password: 'TestPassword123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('integration-test@example.com');
      expect(response.body.data.token).toBeDefined();

      authToken = response.body.data.token;
    });

    it('should return error for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'integration-test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return error for non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('integration-test@example.com');
    });

    it('should return error without token', async () => {
      const response = await request(app).get('/api/v1/auth/profile').expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return error with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ token: authToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should return error without token', async () => {
      const response = await request(app).post('/api/v1/auth/refresh').expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});