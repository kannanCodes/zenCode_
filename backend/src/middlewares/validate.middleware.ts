import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../shared/utils/AppError';
import { STATUS_CODES } from '../shared/constants/status';

export const validateRequest = (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues.map((e) => e.message).join(', ');
      return next(new AppError(message, STATUS_CODES.BAD_REQUEST));
    }

    req.body = result.data;
    next();
  };

export const validateQuery = (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const message = result.error.issues.map((e) => e.message).join(', ');
      return next(new AppError(message, STATUS_CODES.BAD_REQUEST));
    }

    req.validatedQuery = result.data;

    next();
  };
