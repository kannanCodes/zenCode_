import { Response } from 'express';
import { STATUS_CODES } from '../constants/status';

export const sendSuccess = <T>(
  res: Response,
  options: {
    statusCode?: number;
    message?: string;
    data?: T;
    meta?: Record<string, unknown>;
  },
): void => {
  const { statusCode = STATUS_CODES.OK, message, data, meta } = options;
  res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta !== undefined && { meta }),
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number,
): void => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};
