import { Request, Response, NextFunction } from 'express';
import { validateSchema } from '../utils/validation';
import { AppError } from '../utils/errors';

export const validate = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = { ...req.body, ...req.query, ...req.params };
      validateSchema(schema, data);
      next();
    } catch (error: any) {
      if (error.message) {
        try {
          const details = JSON.parse(error.message);
          throw new AppError('Validation failed', 400, true, details);
        } catch {
          throw new AppError(error.message, 400);
        }
      }
      next(error);
    }
  };
};