import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { subscriptionMiddleware } from '../../shared/di/payment.container';
import { aiHintController } from '../../shared/di/ai-hint.container';
import { AI_HINT_RATE_LIMITER } from '../../constants/ai-hint.constants';

const router = Router();

const aiHintRateLimiter = rateLimit({
  windowMs: AI_HINT_RATE_LIMITER.WINDOW_MS,
  max: AI_HINT_RATE_LIMITER.MAX_REQUESTS,
  message: AI_HINT_RATE_LIMITER.MESSAGE,
  standardHeaders: true,
  legacyHeaders: false,
});

// GET /api/ai-hints/:problemId/status
router.get(
  '/:problemId/status',
  authMiddleware,
  subscriptionMiddleware.requireFeatureAccess('aiHints'),
  aiHintController.getStatus
);

// POST /api/ai-hints/:problemId
router.post(
  '/:problemId',
  authMiddleware,
  subscriptionMiddleware.requireFeatureAccess('aiHints'),
  aiHintRateLimiter,
  aiHintController.generate
);

export default router;
