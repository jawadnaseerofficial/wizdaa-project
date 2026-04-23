import { Response } from 'express';
import { ErrorResponse, ValidationError } from '../types';
import logger from '../config/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: ValidationError[];

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true, details?: ValidationError[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: ValidationError[]) {
    super(message, 400, true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 403, true);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, true);
  }
}

export const handleError = (error: Error, res: Response): void => {
  logger.error('Error occurred:', { message: error.message, stack: error.stack });

  if (error instanceof AppError) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: error.message,
      statusCode: error.statusCode,
    };

    if (error.details) {
      errorResponse.details = error.details;
    }

    res.status(error.statusCode).json(errorResponse);
    return;
  }

  const errorResponse: ErrorResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    statusCode: 500,
  };

  res.status(500).json(errorResponse);
};

export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};