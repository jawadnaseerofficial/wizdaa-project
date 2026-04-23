import { Response, NextFunction } from 'express';
import { TimeOffService } from '../services';
import { asyncHandler } from '../utils';
import { AuthRequest } from '../types';

export class TimeOffController {
  private timeOffService: TimeOffService;

  constructor() {
    this.timeOffService = new TimeOffService();
  }

  createTimeOffRequest = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const request = await this.timeOffService.createTimeOffRequest(req.user.id, req.body);

    res.status(201).json({
      success: true,
      data: request,
      message: 'Time off request created successfully',
    });
  });

  getTimeOffRequests = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const filters = {
      status: req.query.status as any,
      startDateFrom: req.query.startDateFrom as string,
      startDateTo: req.query.startDateTo as string,
      userId: req.query.userId as string,
      page: parseInt(req.query.page as string) || 1,
      pageSize: parseInt(req.query.pageSize as string) || 10,
    };

    const result = await this.timeOffService.getTimeOffRequests(filters, req.user.id, req.user.role);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  getTimeOffRequestById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const request = await this.timeOffService.getTimeOffRequestById(req.params.id, req.user.id, req.user.role);

    res.status(200).json({
      success: true,
      data: request,
    });
  });

  approveTimeOffRequest = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const request = await this.timeOffService.approveTimeOffRequest(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      data: request,
      message: 'Time off request approved successfully',
    });
  });

  rejectTimeOffRequest = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const request = await this.timeOffService.rejectTimeOffRequest(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      data: request,
      message: 'Time off request rejected successfully',
    });
  });

  cancelTimeOffRequest = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const request = await this.timeOffService.cancelTimeOffRequest(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      data: request,
      message: 'Time off request cancelled successfully',
    });
  });

  getTimeOffBalance = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const balance = await this.timeOffService.getTimeOffBalance(req.user.id);

    res.status(200).json({
      success: true,
      data: balance,
    });
  });
}