import { Request, Response, NextFunction } from 'express';

import { AppError } from '../shared/utils/AppError';
import { STATUS_CODES } from '../shared/constants/status';
import { AUTH_MESSAGES } from '../modules/auth/constants/auth.messages';

import { authRepository, tokenService } from '../shared/di/container';

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];

    let payload;
    try {
      payload = tokenService.verifyAccessToken(token);
    } catch {
      throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
    }

    const user = await authRepository.findById(payload.sub);

    if (!user || user.isBlocked) {
      throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    next(error);
  }
};
