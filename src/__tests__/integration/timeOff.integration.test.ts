import request from 'supertest';
import app from '../../index';
import { PrismaClient, UserRole, RequestStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Time-Off Integration Tests', () => {
  let employeeToken: string;
  let managerToken: string;
  let adminToken: string;
  let employeeId: string;
  let managerId: string;
  let requestId: string;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash('TestPassword123', 10);

    const employee = await prisma.user.create({
      data: {
        email: 'employee-integration@example.com',
        password: hashedPassword,
        firstName: 'Employee',
        lastName: 'Integration',
        role: UserRole.EMPLOYEE,
      },
    });

    const manager = await prisma.user.create({
      data: {
        email: 'manager-integration@example.com',
        password: hashedPassword,
        firstName: 'Manager',
        lastName: 'Integration',
        role: UserRole.MANAGER,
      },
    });

    const admin = await prisma.user.create({
      data: {
        email: 'admin-integration@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Integration',
        role: UserRole.ADMIN,
      },
    });

    employeeId = employee.id;
    managerId = manager.id;

    await prisma.timeOffBalance.create({
      data: {
        userId: employee.id,
        totalDays: 20,
        usedDays: 0,
        pendingDays: 0,
        remainingDays: 20,
        year: new Date().getFullYear(),
      },
    });

    await prisma.timeOffBalance.create({
      data: {
        userId: manager.id,
        totalDays: 20,
        usedDays: 0,
        pendingDays: 0,
        remainingDays: 20,
        year: new Date().getFullYear(),
      },
    });

    const employeeLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'employee-integration@example.com',
      password: 'TestPassword123',
    });

    const managerLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'manager-integration@example.com',
      password: 'TestPassword123',
    });

    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'admin-integration@example.com',
      password: 'TestPassword123',
    });

    employeeToken = employeeLogin.body.data.token;
    managerToken = managerLogin.body.data.token;
    adminToken = adminLogin.body.data.token;
  });

  afterAll(async () => {
    await prisma.timeOffRequest.deleteMany();
    await prisma.timeOffBalance.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/time-off', () => {
    it('should create a time off request as employee', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 10);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 4);

      const response = await request(app)
        .post('/api/v1/time-off')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          reason: 'Family vacation',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(RequestStatus.PENDING);
      expect(response.body.data.days).toBe(5);

      requestId = response.body.data.id;
    });

    it('should return error for invalid date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 10);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() - 2);

      const response = await request(app)
        .post('/api/v1/time-off')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          reason: 'Invalid range',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return error for past dates', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 10);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 4);

      const response = await request(app)
        .post('/api/v1/time-off')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          reason: 'Past dates',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/time-off')
        .send({
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/time-off', () => {
    it('should get all time off requests as employee', async () => {
      const response = await request(app)
        .get('/api/v1/time-off')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toBeInstanceOf(Array);
      expect(response.body.data.data.length).toBeGreaterThan(0);
    });

    it('should get all time off requests as manager', async () => {
      const response = await request(app)
        .get('/api/v1/time-off')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toBeInstanceOf(Array);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/v1/time-off?status=PENDING')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data.every((req: any) => req.status === RequestStatus.PENDING)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/time-off?page=1&pageSize=10')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.pageSize).toBe(10);
    });
  });

  describe('GET /api/v1/time-off/:id', () => {
    it('should get time off request by id as owner', async () => {
      const response = await request(app)
        .get(`/api/v1/time-off/${requestId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(requestId);
    });

    it('should get time off request by id as manager', async () => {
      const response = await request(app)
        .get(`/api/v1/time-off/${requestId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return error for non-existent request', async () => {
      const response = await request(app)
        .get('/api/v1/time-off/non-existent-id')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/time-off/:id/approve', () => {
    it('should approve time off request as manager', async () => {
      const response = await request(app)
        .put(`/api/v1/time-off/${requestId}/approve`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(RequestStatus.APPROVED);
    });

    it('should return error when employee tries to approve', async () => {
      const response = await request(app)
        .put(`/api/v1/time-off/${requestId}/approve`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return error for already approved request', async () => {
      const response = await request(app)
        .put(`/api/v1/time-off/${requestId}/approve`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/time-off/:id/reject', () => {
    it('should reject time off request as manager', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 20);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 2);

      const createResponse = await request(app)
        .post('/api/v1/time-off')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          reason: 'Test rejection',
        });

      const newRequestId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/v1/time-off/${newRequestId}/reject`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(RequestStatus.REJECTED);
    });
  });

  describe('PUT /api/v1/time-off/:id/cancel', () => {
    it('should cancel own pending time off request as employee', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 30);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 2);

      const createResponse = await request(app)
        .post('/api/v1/time-off')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          reason: 'Test cancellation',
        });

      const newRequestId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/v1/time-off/${newRequestId}/cancel`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(RequestStatus.CANCELLED);
    });

    it('should return error when trying to cancel someone else request', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 40);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 2);

      const createResponse = await request(app)
        .post('/api/v1/time-off')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          reason: 'Manager request',
        });

      const managerRequestId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/v1/time-off/${managerRequestId}/cancel`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return error when trying to cancel approved request', async () => {
      const response = await request(app)
        .put(`/api/v1/time-off/${requestId}/cancel`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/time-off/balance/me', () => {
    it('should get user time off balance', async () => {
      const response = await request(app)
        .get('/api/v1/time-off/balance/me')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalDays).toBe(20);
      expect(response.body.data.usedDays).toBeGreaterThanOrEqual(0);
      expect(response.body.data.remainingDays).toBeGreaterThanOrEqual(0);
    });

    it('should return error without authentication', async () => {
      const response = await request(app).get('/api/v1/time-off/balance/me').expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/v1/health').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Service is healthy');
    });
  });
});