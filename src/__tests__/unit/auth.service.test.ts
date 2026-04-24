import { AuthService } from '../../auth/auth.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

const mockUser = {
  id: 'user-1',
  email: 'employee@wizdaa.com',
  password: 'hashed-pass',
  firstName: 'John',
  lastName: 'Doe',
  role: 'EMPLOYEE',
};

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const jwtMock = {
  sign: jest.fn().mockReturnValue('fake-jwt-token'),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService(prismaMock as any, jwtMock as any);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns null for invalid credentials', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const result = await authService.validateUser('wrong@wizdaa.com', 'badpass');
    expect(result).toBeNull();
  });

  it('returns user for valid credentials', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
    jest.spyOn(bcrypt as any, 'compare').mockResolvedValue(true);

    const result = await authService.validateUser('employee@wizdaa.com', 'Password123!');
    expect(result).toEqual(mockUser);
  });

  it('throws when registering with an email already used', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
    await expect(
      authService.register({
        email: 'employee@wizdaa.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('registers a new user successfully', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(mockUser);
    jest.spyOn(bcrypt as any, 'hash').mockResolvedValue('hashed-pass');

    const result = await authService.register({
      email: 'employee@wizdaa.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      role: 'EMPLOYEE',
    } as any);

    expect(prismaMock.user.create).toHaveBeenCalled();
    expect(result).toEqual({
      id: 'user-1',
      email: 'employee@wizdaa.com',
      role: 'EMPLOYEE',
    });
  });

  it('throws UnauthorizedException on invalid login', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await expect(
      authService.login({ email: 'employee@wizdaa.com', password: 'Password123!' } as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('returns access token on successful login', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
    jest.spyOn(bcrypt as any, 'compare').mockResolvedValue(true);

    const response = await authService.login({ email: 'employee@wizdaa.com', password: 'Password123!' } as any);

    expect(response).toEqual({
      accessToken: 'fake-jwt-token',
      user: {
        id: 'user-1',
        email: 'employee@wizdaa.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE',
      },
    });
  });
});
