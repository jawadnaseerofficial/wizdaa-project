import { TimeOffController } from '../../time-off/time-off.controller';

describe('TimeOffController', () => {
  let controller: TimeOffController;
  const timeOffService = {
    createRequest: jest.fn().mockResolvedValue({ id: 'request-1' }),
    getRequests: jest.fn().mockResolvedValue([]),
    getBalances: jest.fn().mockResolvedValue([]),
    approveRequest: jest.fn().mockResolvedValue({ id: 'request-1', status: 'APPROVED' }),
    rejectRequest: jest.fn().mockResolvedValue({ id: 'request-1', status: 'REJECTED' }),
    cancelRequest: jest.fn().mockResolvedValue({ id: 'request-1', status: 'CANCELLED' }),
  };

  beforeEach(() => {
    controller = new TimeOffController(timeOffService as any);
  });

  it('creates a new time-off request', async () => {
    const result = await controller.createRequest({ user: { sub: 'user-1' } } as any, { days: 2 } as any);
    expect(timeOffService.createRequest).toHaveBeenCalledWith('user-1', { days: 2 });
    expect(result).toEqual({ id: 'request-1' });
  });

  it('gets user requests', async () => {
    await controller.getRequests({ user: { sub: 'user-1' } } as any);
    expect(timeOffService.getRequests).toHaveBeenCalledWith('user-1');
  });

  it('gets user balances', async () => {
    await controller.getBalances({ user: { sub: 'user-1' } } as any);
    expect(timeOffService.getBalances).toHaveBeenCalledWith('user-1');
  });

  it('approves a request', async () => {
    const result = await controller.approveRequest('request-1', { user: { sub: 'manager-1' } } as any);
    expect(timeOffService.approveRequest).toHaveBeenCalledWith('request-1', 'manager-1');
    expect(result).toEqual({ id: 'request-1', status: 'APPROVED' });
  });

  it('rejects a request', async () => {
    await controller.rejectRequest('request-1', { user: { sub: 'manager-1' } } as any);
    expect(timeOffService.rejectRequest).toHaveBeenCalledWith('request-1', 'manager-1');
  });

  it('cancels a request', async () => {
    await controller.cancelRequest('request-1', { user: { sub: 'user-1' } } as any);
    expect(timeOffService.cancelRequest).toHaveBeenCalledWith('request-1', 'user-1');
  });
});
