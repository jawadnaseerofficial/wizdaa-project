import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';

@Injectable()
export class TimeOffService {
  constructor(private prisma: PrismaService) {}

  async createRequest(userId: string, dto: CreateRequestDto) {
    const balance = await this.prisma.timeOffBalance.findUnique({
      where: {
        userId_locationId_year: {
          userId,
          locationId: dto.locationId,
          year: dto.year,
        },
      },
    });

    if (!balance) {
      throw new BadRequestException('No balance found for the selected location and year');
    }

    const remainingAllowance = balance.availableDays - balance.pendingDays;
    if (remainingAllowance < dto.days) {
      throw new BadRequestException('Insufficient balance for this time-off request');
    }

    const request = await this.prisma.timeOffRequest.create({
      data: {
        userId,
        locationId: dto.locationId,
        balanceId: balance.id,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        days: dto.days,
        reason: dto.reason,
        status: 'PENDING',
      },
    });

    await this.prisma.timeOffBalance.update({
      where: { id: balance.id },
      data: {
        pendingDays: {
          increment: dto.days,
        },
      },
    });

    return request;
  }

  async getRequests(userId: string) {
    return this.prisma.timeOffRequest.findMany({
      where: { userId },
      include: { location: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBalances(userId: string) {
    return this.prisma.timeOffBalance.findMany({
      where: { userId },
      include: { location: true },
      orderBy: [{ year: 'desc' }],
    });
  }

  async getRequestById(id: string) {
    const request = await this.prisma.timeOffRequest.findUnique({
      where: { id },
      include: { balance: true },
    });
    if (!request) {
      throw new NotFoundException('Time-off request not found');
    }
    return request;
  }

  async approveRequest(requestId: string, approverId: string) {
    const request = await this.getRequestById(requestId);
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be approved');
    }

    const balance = request.balance;
    if (balance.availableDays < request.days) {
      throw new BadRequestException('Balance has changed and is insufficient for approval');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.timeOffBalance.update({
        where: { id: balance.id },
        data: {
          pendingDays: { decrement: request.days },
          usedDays: { increment: request.days },
          availableDays: { decrement: request.days },
        },
      });
      return tx.timeOffRequest.update({
        where: { id: request.id },
        data: {
          status: 'APPROVED',
          approverId,
          approvedAt: new Date(),
        },
      });
    });
  }

  async rejectRequest(requestId: string, approverId: string) {
    const request = await this.getRequestById(requestId);
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.timeOffBalance.update({
        where: { id: request.balanceId },
        data: {
          pendingDays: { decrement: request.days },
        },
      });
      return tx.timeOffRequest.update({
        where: { id: request.id },
        data: {
          status: 'REJECTED',
          approverId,
          rejectedAt: new Date(),
        },
      });
    });
  }

  async cancelRequest(requestId: string, userId: string) {
    const request = await this.getRequestById(requestId);
    if (request.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own requests');
    }
    if (request.status === 'CANCELLED') {
      throw new BadRequestException('Request is already cancelled');
    }

    return this.prisma.$transaction(async (tx) => {
      const updates: any = {
        cancelledAt: new Date(),
        status: 'CANCELLED',
      };

      if (request.status === 'PENDING') {
        await tx.timeOffBalance.update({
          where: { id: request.balanceId },
          data: {
            pendingDays: { decrement: request.days },
          },
        });
      }

      if (request.status === 'APPROVED') {
        await tx.timeOffBalance.update({
          where: { id: request.balanceId },
          data: {
            usedDays: { decrement: request.days },
            availableDays: { increment: request.days },
          },
        });
      }

      return tx.timeOffRequest.update({
        where: { id: request.id },
        data: updates,
      });
    });
  }
}
