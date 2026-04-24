import { HcmController } from '../../hcm/hcm.controller';

describe('HcmController', () => {
  let controller: HcmController;
  const hcmService = {
    getRealtimeBalance: jest.fn().mockResolvedValue({ availableDays: 10 }),
    batchSync: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(() => {
    controller = new HcmController(hcmService as any);
  });

  it('returns realtime balance by query parameters', async () => {
    const result = await controller.getRealtimeBalance('emp-1', 'loc-1', '2026');
    expect(hcmService.getRealtimeBalance).toHaveBeenCalledWith('emp-1', 'loc-1', 2026);
    expect(result).toEqual({ availableDays: 10 });
  });

  it('syncs batch HCM payloads', async () => {
    const payload = [{ employeeId: 'emp-1', locationId: 'loc-1', year: 2026, availableDays: 12 }];
    const result = await controller.batchSync(payload as any);
    expect(hcmService.batchSync).toHaveBeenCalledWith(payload);
    expect(result).toEqual({ success: true });
  });
});
