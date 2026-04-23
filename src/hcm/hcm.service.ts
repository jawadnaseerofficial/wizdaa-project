import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HcmService {
  constructor(private prisma: PrismaService) {}

  async getRealtimeBalance(employeeId: string, locationId: string, year: number) {
    if (!employeeId || !locationId || !year) {
      throw new BadRequestException('employeeId, locationId and year are required');
    }

    const balance = await this.prisma.timeOffBalance.findUnique({
      where: {
        userId_locationId_year: {
          userId: employeeId,
          locationId,
          year,
        },
      },
      include: { location: true },
    });

    if (!balance) {
      throw new BadRequestException('Balance not found for the requested employee and location');
    }

    return {
      employeeId,
      locationId,
      year,
      availableDays: balance.availableDays,
      pendingDays: balance.pendingDays,
      usedDays: balance.usedDays,
      totalDays: balance.totalDays,
    };
  }

  async batchSync(payload: Array<{ employeeId: string; locationId: string; year: number; availableDays: number }>) {
    const results = [];
    for (const item of payload) {
      if (!item.employeeId || !item.locationId || item.year === undefined || item.availableDays === undefined) {
        results.push({ ...item, status: 'invalid_payload' });
        continue;
      }

      const existing = await this.prisma.timeOffBalance.findUnique({
        where: {
          userId_locationId_year: {
            userId: item.employeeId,
            locationId: item.locationId,
            year: item.year,
          },
        },
      });

      if (!existing) {
        results.push({ ...item, status: 'balance_not_found' });
        continue;
      }

      await this.prisma.timeOffBalance.update({
        where: { id: existing.id },
        data: {
          availableDays: item.availableDays,
        },
      });

      await this.prisma.hcmSyncEvent.create({
        data: {
          userId: item.employeeId,
          locationId: item.locationId,
          year: item.year,
          externalBalance: item.availableDays,
          status: 'synced',
        },
      });

      results.push({ ...item, status: 'synced' });
    }

    return { results };
  }
}
