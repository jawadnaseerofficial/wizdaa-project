import { Router } from 'express';
import { TimeOffController } from '../controllers';
import { authenticate, authorize, validate } from '../middleware';
import { createTimeOffRequestSchema, updateTimeOffRequestSchema, listTimeOffRequestsSchema } from '../utils/validation';
import { UserRole } from '@prisma/client';

const router = Router();
const timeOffController = new TimeOffController();

router.post(
  '/',
  authenticate,
  authorize(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN),
  validate(createTimeOffRequestSchema),
  timeOffController.createTimeOffRequest
);

router.get(
  '/',
  authenticate,
  authorize(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN),
  validate(listTimeOffRequestsSchema),
  timeOffController.getTimeOffRequests
);

router.get(
  '/:id',
  authenticate,
  authorize(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN),
  timeOffController.getTimeOffRequestById
);

router.put(
  '/:id/approve',
  authenticate,
  authorize(UserRole.MANAGER, UserRole.ADMIN),
  timeOffController.approveTimeOffRequest
);

router.put(
  '/:id/reject',
  authenticate,
  authorize(UserRole.MANAGER, UserRole.ADMIN),
  timeOffController.rejectTimeOffRequest
);

router.put(
  '/:id/cancel',
  authenticate,
  authorize(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN),
  timeOffController.cancelTimeOffRequest
);

router.get(
  '/balance/me',
  authenticate,
  authorize(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN),
  timeOffController.getTimeOffBalance
);

export default router;