import { HcmService } from '../../hcm/hcm.service';
import { BadRequestException } from '@nestjs/common';

const prismaMock = {
  timeOffBalance: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  hcmSyncEvent: {
    create: jest.fn(),
  },
};

describe('HcmService', () => {
  let service: HcmService;

  beforeEach(() => {
    service = new HcmService(prismaMock as any);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('throws if required parameters are missing for realtime balance', async () => {
    await expect(service.getRealtimeBalance('', 'loc', 2026)).rejects.toThrow(BadRequestException);
  });

  it('throws if balance is not found for realtime request', async () => {
    prismaMock.timeOffBalance.findUnique.mockResolvedValue(null);
    await expect(service.getRealtimeBalance('user', 'loc', 2026)).rejects.toThrow(BadRequestException);
  });

  it('returns realtime balance data successfully', async () => {
    prismaMock.timeOffBalance.findUnique.mockResolvedValue({
      availableDays: 18,
      pendingDays: 3,
      usedDays: 2,
      totalDays: 20,
    });

    const result = await service.getRealtimeBalance('user', 'loc', 2026);
    expect(result).toEqual({
      employeeId: 'user',
      locationId: 'loc',
      year: 2026,
      availableDays: 18,
      pendingDays: 3,
      usedDays: 2,
      totalDays: 20,
    });
  });

  it('returns invalid_payload for an invalid batch item', async () => {
    const result = await service.batchSync([{ employeeId: '', locationId: 'loc', year: 2026, availableDays: 10 }]);
    expect(result.results[0].status).toBe('invalid_payload');
  });

  it('returns balance_not_found when batch item does not exist', async () => {
    prismaMock.timeOffBalance.findUnique.mockResolvedValue(null);
    const result = await service.batchSync([
      { employeeId: 'user', locationId: 'loc', year: 2026, availableDays: 10 },
    ]);
    expect(result.results[0].status).toBe('balance_not_found');
  });

  it('syncs balance successfully during batch update', async () => {
    prismaMock.timeOffBalance.findUnique.mockResolvedValue({ id: 'balance-1' });
    prismaMock.timeOffBalance.update.mockResolvedValue({});
    prismaMock.hcmSyncEvent.create.mockResolvedValue({});

    const result = await service.batchSync([
      { employeeId: 'user', locationId: 'loc', year: 2026, availableDays: 10 },
    ]);

    expect(prismaMock.timeOffBalance.update).toHaveBeenCalledWith({
      where: { id: 'balance-1' },
      data: { availableDays: 10 },
    });
    expect(prismaMock.hcmSyncEvent.create).toHaveBeenCalled();
    expect(result.results[0].status).toBe('synced');
  });
});
