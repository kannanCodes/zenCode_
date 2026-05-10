import { Request, Response, NextFunction } from 'express';
import { UserRole } from "../shared/constants/roles";
import { AppError } from "../shared/utils/AppError";
import { STATUS_CODES } from "../shared/constants/status";
import { AUTH_MESSAGES } from "../constants/messages";

export const roleGuard =
  (...allowedRoles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role as UserRole)) {
      throw new AppError(AUTH_MESSAGES.ACCESS_DENIED, STATUS_CODES.FORBIDDEN);
    }

    next();
  };
