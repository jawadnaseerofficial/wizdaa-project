import { PrismaService } from '../../prisma/prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
  });

  it('calls $connect when module initializes', async () => {
    service.$connect = jest.fn().mockResolvedValue(undefined);
    await service.onModuleInit();
    expect(service.$connect).toHaveBeenCalled();
  });

  it('registers a beforeExit hook for shutdown', () => {
    const spy = jest.spyOn(process, 'on').mockImplementation(() => service as any);
    service.enableShutdownHooks({ close: jest.fn() } as any);
    expect(spy).toHaveBeenCalledWith('beforeExit', expect.any(Function));
    spy.mockRestore();
  });
});
