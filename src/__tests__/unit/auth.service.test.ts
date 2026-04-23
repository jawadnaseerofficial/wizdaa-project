import { AuthService } from '../../services';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: new PrismaClient(),
}));

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  generateToken: jest.fn(() => 'test-token'),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: PrismaClient;

  beforeEach(() => {
    authService = new AuthService();
    prisma = new PrismaClient();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.EMPLOYEE,
        createdAt: new Date(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser as any);
      jest.spyOn(prisma.timeOffBalance, 'create').mockResolvedValue({} as any);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.token).toBe('test-token');
    });

    it('should throw error if user already exists', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: '1' } as any);

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'Password123',
          firstName: 'John',
          lastName: 'Doe',
        })
      ).rejects.toThrow('User with this email already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed-password',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.EMPLOYEE,
        isActive: true,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('test-token');
    });

    it('should throw error if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'Password123',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error if password is invalid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed-password',
        isActive: true,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrong-password',
        })
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.EMPLOYEE,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      const result = await authService.getProfile('1');

      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(authService.getProfile('1')).rejects.toThrow('User not found');
    });
  });
});