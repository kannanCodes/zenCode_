import { Router } from 'express';
import { compilerController } from '../../shared/di/compiler.container';
import { cacheService } from '../../shared/di/shared.container';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { executeCodeValidator } from '../../validators/compiler/compiler.validator';
import { granularRateLimiter } from '../../middlewares/granularRateLimit.middleware';

const router = Router();

// Overall compiler rate limit (20 requests per minute)
const compilerOverallLimit = granularRateLimiter(
  cacheService,
  20,
  60,
  'compiler:overall'
);

// Per-problem rate limit (5 requests per minute)
const problemSpecificLimit = granularRateLimiter(
  cacheService,
  5,
  60,
  'compiler:problem',
  (req) => {
    const userId = req.user?.id || 'anonymous';
    const problemId = (req.body as { problemId?: string })?.problemId || 'general';
    return `${userId}:${problemId}`;
  }
);

router.post(
  '/execute',
  authMiddleware,
  compilerOverallLimit,
  problemSpecificLimit,
  validateRequest(executeCodeValidator),
  compilerController.executeCode.bind(compilerController)
);

router.get(
  '/result/:token',
  authMiddleware,
  compilerController.getResult.bind(compilerController)
);

export default router;
