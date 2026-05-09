import { Request, Response, NextFunction } from "express";
import { ICacheService } from "../shared/interfaces/cache-service.interface";
import { AppError } from "../shared/utils/AppError";
import { STATUS_CODES } from "../shared/constants/status";
import { AUTH_MESSAGES } from "../modules/auth/constants/auth.messages";

export const rateLimiter =
  (cache: ICacheService, limit: number, windowSeconds: number) =>
    async (req: Request, _res: Response, next: NextFunction) => {
      try {
        const key = `rate:${req.ip}:${req.path}`;
        const current = await cache.get<number>(key);

        if (current && current >= limit) {
          throw new AppError(AUTH_MESSAGES.RATE_LIMIT_EXCEEDED, STATUS_CODES.TOO_MANY_REQUESTS);
        }

        const newValue = (current || 0) + 1;
        await cache.set(key, newValue, windowSeconds);

        next();
      } catch (error) {
        next(error);
      }
    };
