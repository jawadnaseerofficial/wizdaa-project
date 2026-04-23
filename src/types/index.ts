import { UserRole, RequestStatus } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface TimeOffRequestData {
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface TimeOffRequestFilters {
  status?: RequestStatus;
  startDateFrom?: string;
  startDateTo?: string;
  userId?: string;
}

export interface TimeOffBalance {
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: ValidationError[];
  statusCode: number;
}