import { Request, Response, NextFunction } from 'express';
import { handleError } from '../utils/errors';

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  handleError(error, res);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
};