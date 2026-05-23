import { Request, Response, NextFunction } from "express";
import { ICacheService } from "../interfaces/service-interfaces/auth/ICacheService";
import { AppError } from "../shared/utils/AppError";
import { STATUS_CODES } from "../shared/constants/status";
import { AUTH_MESSAGES } from "../constants/messages";

export const granularRateLimiter =
  (
    cache: ICacheService,
    limit: number,
    windowSeconds: number,
    keyPrefix: string,
    keyGenerator?: (req: Request) => string
  ) =>
    async (req: Request, _res: Response, next: NextFunction) => {
      try {
        const keySuffix = keyGenerator ? keyGenerator(req) : `${req.ip}:${req.path}`;
        const key = `rate:${keyPrefix}:${keySuffix}`;
        
        const current = await cache.get<number>(key);

        if (current && current >= limit) {
          throw new AppError(AUTH_MESSAGES.RATE_LIMIT_SLOW_DOWN, STATUS_CODES.TOO_MANY_REQUESTS);
        }

        const newValue = (current || 0) + 1;
        await cache.set(key, newValue, windowSeconds);

        next();
      } catch (error) {
        next(error);
      }
    };
