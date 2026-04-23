import { TimeOffService } from '../../services';
import { PrismaClient, RequestStatus, UserRole } from '@prisma/client';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: new PrismaClient(),
}));

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  calculateDaysBetween: jest.fn((start, end) => {
    const diff = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }),
  isValidDateRange: jest.fn(() => true),
}));

describe('TimeOffService', () => {
  let timeOffService: TimeOffService;
  let prisma: PrismaClient;

  beforeEach(() => {
    timeOffService = new TimeOffService();
    prisma = new PrismaClient();
  });

  describe('createTimeOffRequest', () => {
    it('should create a time off request successfully', async () => {
      const mockBalance = {
        userId: '1',
        totalDays: 20,
        usedDays: 0,
        pendingDays: 0,
        remainingDays: 20,
      };

      const mockRequest = {
        id: '1',
        userId: '1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
        days: 5,
        reason: 'Vacation',
        status: RequestStatus.PENDING,
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      jest.spyOn(prisma.timeOffBalance, 'findUnique').mockResolvedValue(mockBalance as any);
      jest.spyOn(prisma.timeOffRequest, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.timeOffRequest, 'create').mockResolvedValue(mockRequest as any);
      jest.spyOn(prisma.timeOffBalance, 'update').mockResolvedValue({} as any);

      const result = await timeOffService.createTimeOffRequest('1', {
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        reason: 'Vacation',
      });

      expect(result).toEqual(mockRequest);
    });

    it('should throw error if insufficient balance', async () => {
      const mockBalance = {
        userId: '1',
        totalDays: 20,
        usedDays: 15,
        pendingDays: 0,
        remainingDays: 5,
      };

      jest.spyOn(prisma.timeOffBalance, 'findUnique').mockResolvedValue(mockBalance as any);

      await expect(
        timeOffService.createTimeOffRequest('1', {
          startDate: '2024-01-01',
          endDate: '2024-01-10',
          reason: 'Vacation',
        })
      ).rejects.toThrow('Insufficient balance');
    });

    it('should throw error if overlapping request exists', async () => {
      const mockBalance = {
        userId: '1',
        totalDays: 20,
        usedDays: 0,
        pendingDays: 0,
        remainingDays: 20,
      };

      const mockOverlappingRequest = {
        id: '2',
        userId: '1',
        startDate: new Date('2024-01-03'),
        endDate: new Date('2024-01-07'),
        status: RequestStatus.PENDING,
      };

      jest.spyOn(prisma.timeOffBalance, 'findUnique').mockResolvedValue(mockBalance as any);
      jest.spyOn(prisma.timeOffRequest, 'findMany').mockResolvedValue([mockOverlappingRequest] as any);

      await expect(
        timeOffService.createTimeOffRequest('1', {
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          reason: 'Vacation',
        })
      ).rejects.toThrow('You already have a time off request for this period');
    });
  });

  describe('getTimeOffRequests', () => {
    it('should return paginated time off requests', async () => {
      const mockRequests = [
        {
          id: '1',
          userId: '1',
          status: RequestStatus.PENDING,
          user: { id: '1', email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
        },
      ];

      jest.spyOn(prisma.timeOffRequest, 'findMany').mockResolvedValue(mockRequests as any);
      jest.spyOn(prisma.timeOffRequest, 'count').mockResolvedValue(1);

      const result = await timeOffService.getTimeOffRequests({}, '1', UserRole.EMPLOYEE);

      expect(result.data).toEqual(mockRequests);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('approveTimeOffRequest', () => {
    it('should approve a time off request successfully', async () => {
      const mockRequest = {
        id: '1',
        userId: '1',
        days: 5,
        status: RequestStatus.PENDING,
      };

      const mockBalance = {
        userId: '1',
        totalDays: 20,
        usedDays: 0,
        pendingDays: 5,
        remainingDays: 15,
      };

      const mockUpdatedRequest = {
        id: '1',
        userId: '1',
        days: 5,
        status: RequestStatus.APPROVED,
        approvedBy: '2',
        approvedAt: new Date(),
        user: { id: '1', email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
      };

      jest.spyOn(prisma.timeOffRequest, 'findUnique').mockResolvedValue(mockRequest as any);
      jest.spyOn(prisma.timeOffBalance, 'findUnique').mockResolvedValue(mockBalance as any);
      jest.spyOn(prisma.timeOffRequest, 'update').mockResolvedValue(mockUpdatedRequest as any);
      jest.spyOn(prisma.timeOffBalance, 'update').mockResolvedValue({} as any);

      const result = await timeOffService.approveTimeOffRequest('1', '2');

      expect(result.status).toBe(RequestStatus.APPROVED);
    });

    it('should throw error if request not found', async () => {
      jest.spyOn(prisma.timeOffRequest, 'findUnique').mockResolvedValue(null);

      await expect(timeOffService.approveTimeOffRequest('1', '2')).rejects.toThrow('Time off request not found');
    });

    it('should throw error if request not pending', async () => {
      const mockRequest = {
        id: '1',
        userId: '1',
        status: RequestStatus.APPROVED,
      };

      jest.spyOn(prisma.timeOffRequest, 'findUnique').mockResolvedValue(mockRequest as any);

      await expect(timeOffService.approveTimeOffRequest('1', '2')).rejects.toThrow('Request is not in pending status');
    });
  });

  describe('rejectTimeOffRequest', () => {
    it('should reject a time off request successfully', async () => {
      const mockRequest = {
        id: '1',
        userId: '1',
        status: RequestStatus.PENDING,
      };

      const mockUpdatedRequest = {
        id: '1',
        userId: '1',
        status: RequestStatus.REJECTED,
        rejectedBy: '2',
        rejectedAt: new Date(),
        user: { id: '1', email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
      };

      jest.spyOn(prisma.timeOffRequest, 'findUnique').mockResolvedValue(mockRequest as any);
      jest.spyOn(prisma.timeOffRequest, 'update').mockResolvedValue(mockUpdatedRequest as any);
      jest.spyOn(prisma.timeOffBalance, 'update').mockResolvedValue({} as any);

      const result = await timeOffService.rejectTimeOffRequest('1', '2');

      expect(result.status).toBe(RequestStatus.REJECTED);
    });
  });

  describe('cancelTimeOffRequest', () => {
    it('should cancel a time off request successfully', async () => {
      const mockRequest = {
        id: '1',
        userId: '1',
        status: RequestStatus.PENDING,
      };

      const mockUpdatedRequest = {
        id: '1',
        userId: '1',
        status: RequestStatus.CANCELLED,
        cancelledAt: new Date(),
        user: { id: '1', email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
      };

      jest.spyOn(prisma.timeOffRequest, 'findUnique').mockResolvedValue(mockRequest as any);
      jest.spyOn(prisma.timeOffRequest, 'update').mockResolvedValue(mockUpdatedRequest as any);
      jest.spyOn(prisma.timeOffBalance, 'update').mockResolvedValue({} as any);

      const result = await timeOffService.cancelTimeOffRequest('1', '1');

      expect(result.status).toBe(RequestStatus.CANCELLED);
    });

    it('should throw error if user tries to cancel someone else request', async () => {
      const mockRequest = {
        id: '1',
        userId: '2',
        status: RequestStatus.PENDING,
      };

      jest.spyOn(prisma.timeOffRequest, 'findUnique').mockResolvedValue(mockRequest as any);

      await expect(timeOffService.cancelTimeOffRequest('1', '1')).rejects.toThrow('You can only cancel your own requests');
    });
  });

  describe('getTimeOffBalance', () => {
    it('should return user time off balance', async () => {
      const mockBalance = {
        userId: '1',
        totalDays: 20,
        usedDays: 5,
        pendingDays: 2,
        remainingDays: 13,
      };

      jest.spyOn(prisma.timeOffBalance, 'findUnique').mockResolvedValue(mockBalance as any);

      const result = await timeOffService.getTimeOffBalance('1');

      expect(result.totalDays).toBe(20);
      expect(result.usedDays).toBe(5);
      expect(result.pendingDays).toBe(2);
      expect(result.remainingDays).toBe(13);
    });

    it('should throw error if balance not found', async () => {
      jest.spyOn(prisma.timeOffBalance, 'findUnique').mockResolvedValue(null);

      await expect(timeOffService.getTimeOffBalance('1')).rejects.toThrow('Time off balance not found');
    });
  });
});