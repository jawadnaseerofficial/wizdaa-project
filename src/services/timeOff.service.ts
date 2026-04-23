import { PrismaClient, RequestStatus, UserRole } from '@prisma/client';
import { calculateDaysBetween, isValidDateRange } from '../utils';
import { TimeOffRequestData, TimeOffRequestFilters, TimeOffBalance, PaginatedResponse } from '../types';
import { NotFoundError, ValidationError, AuthorizationError, ConflictError } from '../utils/errors';
import prisma from '../config/database';

export class TimeOffService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async createTimeOffRequest(userId: string, data: TimeOffRequestData): Promise<any> {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (!isValidDateRange(startDate, endDate)) {
      throw new ValidationError('Invalid date range');
    }

    const days = calculateDaysBetween(startDate, endDate);

    const balance = await this.prisma.timeOffBalance.findUnique({
      where: { userId },
    });

    if (!balance) {
      throw new NotFoundError('Time off balance not found');
    }

    if (days > balance.remainingDays) {
      throw new ValidationError(`Insufficient balance. You have ${balance.remainingDays} days remaining, but requested ${days} days`);
    }

    const overlappingRequests = await this.prisma.timeOffRequest.findMany({
      where: {
        userId,
        status: { in: [RequestStatus.PENDING, RequestStatus.APPROVED] },
        OR: [
          { startDate: { lte: startDate }, endDate: { gte: startDate } },
          { startDate: { lte: endDate }, endDate: { gte: endDate } },
          { startDate: { gte: startDate }, endDate: { lte: endDate } },
        ],
      },
    });

    if (overlappingRequests.length > 0) {
      throw new ConflictError('You already have a time off request for this period');
    }

    const request = await this.prisma.timeOffRequest.create({
      data: {
        userId,
        startDate,
        endDate,
        days,
        reason: data.reason,
        status: RequestStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await this.updatePendingDays(userId);

    return request;
  }

  async getTimeOffRequests(filters: TimeOffRequestFilters, userId?: string, userRole?: UserRole): Promise<PaginatedResponse<any>> {
    const { status, startDateFrom, startDateTo, userId: filterUserId, page = 1, pageSize = 10 } = filters;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (startDateFrom) {
      where.startDate = { ...where.startDate, gte: new Date(startDateFrom) };
    }

    if (startDateTo) {
      where.startDate = { ...where.startDate, lte: new Date(startDateTo) };
    }

    if (userRole === UserRole.EMPLOYEE) {
      where.userId = userId;
    } else if (filterUserId) {
      where.userId = filterUserId;
    }

    const [requests, total] = await Promise.all([
      this.prisma.timeOffRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.timeOffRequest.count({ where }),
    ]);

    return {
      data: requests,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getTimeOffRequestById(id: string, userId: string, userRole: UserRole): Promise<any> {
    const request = await this.prisma.timeOffRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundError('Time off request not found');
    }

    if (userRole === UserRole.EMPLOYEE && request.userId !== userId) {
      throw new AuthorizationError('You can only view your own requests');
    }

    return request;
  }

  async approveTimeOffRequest(id: string, managerId: string): Promise<any> {
    const request = await this.prisma.timeOffRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundError('Time off request not found');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new ValidationError('Request is not in pending status');
    }

    const balance = await this.prisma.timeOffBalance.findUnique({
      where: { userId: request.userId },
    });

    if (!balance) {
      throw new NotFoundError('Time off balance not found');
    }

    if (request.days > balance.remainingDays) {
      throw new ValidationError(`Insufficient balance. User has ${balance.remainingDays} days remaining, but requested ${request.days} days`);
    }

    const updatedRequest = await this.prisma.timeOffRequest.update({
      where: { id },
      data: {
        status: RequestStatus.APPROVED,
        approvedBy: managerId,
        approvedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await this.updateUsedDays(request.userId);

    return updatedRequest;
  }

  async rejectTimeOffRequest(id: string, managerId: string): Promise<any> {
    const request = await this.prisma.timeOffRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundError('Time off request not found');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new ValidationError('Request is not in pending status');
    }

    const updatedRequest = await this.prisma.timeOffRequest.update({
      where: { id },
      data: {
        status: RequestStatus.REJECTED,
        rejectedBy: managerId,
        rejectedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await this.updatePendingDays(request.userId);

    return updatedRequest;
  }

  async cancelTimeOffRequest(id: string, userId: string): Promise<any> {
    const request = await this.prisma.timeOffRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundError('Time off request not found');
    }

    if (request.userId !== userId) {
      throw new AuthorizationError('You can only cancel your own requests');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new ValidationError('You can only cancel pending requests');
    }

    const updatedRequest = await this.prisma.timeOffRequest.update({
      where: { id },
      data: {
        status: RequestStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await this.updatePendingDays(userId);

    return updatedRequest;
  }

  async getTimeOffBalance(userId: string): Promise<TimeOffBalance> {
    const balance = await this.prisma.timeOffBalance.findUnique({
      where: { userId },
    });

    if (!balance) {
      throw new NotFoundError('Time off balance not found');
    }

    return {
      totalDays: balance.totalDays,
      usedDays: balance.usedDays,
      pendingDays: balance.pendingDays,
      remainingDays: balance.remainingDays,
    };
  }

  private async updateUsedDays(userId: string): Promise<void> {
    const approvedRequests = await this.prisma.timeOffRequest.findMany({
      where: {
        userId,
        status: RequestStatus.APPROVED,
      },
    });

    const usedDays = approvedRequests.reduce((sum, req) => sum + req.days, 0);

    const balance = await this.prisma.timeOffBalance.findUnique({
      where: { userId },
    });

    if (balance) {
      await this.prisma.timeOffBalance.update({
        where: { userId },
        data: {
          usedDays,
          remainingDays: balance.totalDays - usedDays,
        },
      });
    }
  }

  private async updatePendingDays(userId: string): Promise<void> {
    const pendingRequests = await this.prisma.timeOffRequest.findMany({
      where: {
        userId,
        status: RequestStatus.PENDING,
      },
    });

    const pendingDays = pendingRequests.reduce((sum, req) => sum + req.days, 0);

    const balance = await this.prisma.timeOffBalance.findUnique({
      where: { userId },
    });

    if (balance) {
      await this.prisma.timeOffBalance.update({
        where: { userId },
        data: {
          pendingDays,
          remainingDays: balance.totalDays - balance.usedDays - pendingDays,
        },
      });
    }
  }
}