import { TimeOffService } from '../../time-off/time-off.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

const mockBalance = {
  id: 'balance-1',
  availableDays: 10,
  pendingDays: 2,
  usedDays: 0,
};

const prismaMock: any = {
  timeOffBalance: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  timeOffRequest: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('TimeOffService', () => {
  let service: TimeOffService;

  beforeEach(() => {
    prismaMock.$transaction.mockImplementation(async (callback: any) => await callback(prismaMock));
    service = new TimeOffService(prismaMock as any);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('throws when there is no balance for a request', async () => {
    prismaMock.timeOffBalance.findUnique.mockResolvedValue(null);

    await expect(
      service.createRequest('user-1', {
        locationId: 'loc',
        year: 2026,
        startDate: '2026-05-01',
        endDate: '2026-05-03',
        days: 3,
        reason: 'Vacation',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when there is insufficient balance', async () => {
    prismaMock.timeOffBalance.findUnique.mockResolvedValue({ ...mockBalance, availableDays: 3, pendingDays: 2 });

    await expect(
      service.createRequest('user-1', {
        locationId: 'loc',
        year: 2026,
        startDate: '2026-05-01',
        endDate: '2026-05-03',
        days: 3,
        reason: 'Vacation',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates a time-off request and reserves pending days', async () => {
    prismaMock.timeOffBalance.findUnique.mockResolvedValue(mockBalance);
    prismaMock.timeOffRequest.create.mockResolvedValue({ id: 'request-1' });
    prismaMock.timeOffBalance.update.mockResolvedValue({});

    const request = await service.createRequest('user-1', {
      locationId: 'loc',
      year: 2026,
      startDate: '2026-05-01',
      endDate: '2026-05-03',
      days: 3,
      reason: 'Vacation',
    } as any);

    expect(prismaMock.timeOffRequest.create).toHaveBeenCalled();
    expect(prismaMock.timeOffBalance.update).toHaveBeenCalledWith({
      where: { id: 'balance-1' },
      data: { pendingDays: { increment: 3 } },
    });
    expect(request).toEqual({ id: 'request-1' });
  });

  it('approves a pending request successfully', async () => {
    prismaMock.timeOffRequest.findUnique.mockResolvedValue({
      id: 'request-1',
      status: 'PENDING',
      days: 2,
      balance: mockBalance,
      balanceId: 'balance-1',
    });

    prismaMock.timeOffBalance.update.mockResolvedValue({});
    prismaMock.timeOffRequest.update.mockResolvedValue({ id: 'request-1', status: 'APPROVED' });

    const result = await service.approveRequest('request-1', 'approver-1');

    expect(result).toEqual({ id: 'request-1', status: 'APPROVED' });
  });

  it('rejects a pending request successfully', async () => {
    prismaMock.timeOffRequest.findUnique.mockResolvedValue({
      id: 'request-1',
      status: 'PENDING',
      days: 2,
      balanceId: 'balance-1',
    });

    prismaMock.timeOffBalance.update.mockResolvedValue({});
    prismaMock.timeOffRequest.update.mockResolvedValue({ id: 'request-1', status: 'REJECTED' });

    const result = await service.rejectRequest('request-1', 'approver-1');
    expect(result).toEqual({ id: 'request-1', status: 'REJECTED' });
  });

  it('cancels a pending request and returns pending days', async () => {
    prismaMock.timeOffRequest.findUnique.mockResolvedValue({
      id: 'request-1',
      userId: 'user-1',
      status: 'PENDING',
      days: 2,
      balanceId: 'balance-1',
    });
    prismaMock.timeOffBalance.update.mockResolvedValue({});
    prismaMock.timeOffRequest.update.mockResolvedValue({ id: 'request-1', status: 'CANCELLED' });

    const result = await service.cancelRequest('request-1', 'user-1');
    expect(result).toEqual({ id: 'request-1', status: 'CANCELLED' });
  });

  it('cancels an approved request and restores available days', async () => {
    prismaMock.timeOffRequest.findUnique.mockResolvedValue({
      id: 'request-1',
      userId: 'user-1',
      status: 'APPROVED',
      days: 2,
      balanceId: 'balance-1',
    });
    prismaMock.timeOffBalance.update.mockResolvedValue({});
    prismaMock.timeOffRequest.update.mockResolvedValue({ id: 'request-1', status: 'CANCELLED' });

    const result = await service.cancelRequest('request-1', 'user-1');
    expect(result).toEqual({ id: 'request-1', status: 'CANCELLED' });
  });

  it('throws when a user cancels another user request', async () => {
    prismaMock.timeOffRequest.findUnique.mockResolvedValue({
      id: 'request-1',
      userId: 'different-user',
      status: 'PENDING',
      days: 2,
      balanceId: 'balance-1',
    });

    await expect(service.cancelRequest('request-1', 'user-1')).rejects.toThrow(ForbiddenException);
  });
});
