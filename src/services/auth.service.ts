import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword, comparePassword, generateToken, generateRefreshToken } from '../utils';
import { LoginCredentials, RegisterData, TokenPayload } from '../types';
import { ConflictError, AuthenticationError, NotFoundError } from '../utils/errors';
import prisma from '../config/database';

export class AuthService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async register(data: RegisterData): Promise<{ user: any; token: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: UserRole.EMPLOYEE,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    await this.prisma.timeOffBalance.create({
      data: {
        userId: user.id,
        totalDays: 20,
        usedDays: 0,
        pendingDays: 0,
        remainingDays: 20,
        year: new Date().getFullYear(),
      },
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  async login(credentials: LoginCredentials): Promise<{ user: any; token: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(credentials.password, user.password);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account is inactive');
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async refreshToken(token: string): Promise<{ token: string }> {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()) as TokenPayload;

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    const newToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { token: newToken };
  }
}