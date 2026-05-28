import { Router } from 'express';
import { adminRevenueController } from '../../shared/di/admin.container';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleGuard } from '../../middlewares/role.middleware';
import { UserRole } from '../../shared/constants/roles';

const router = Router();

router.use(authMiddleware, roleGuard(UserRole.ADMIN));

router.get(
  '/metrics',
  adminRevenueController.getMetrics.bind(adminRevenueController)
);

router.get(
  '/trend',
  adminRevenueController.getTrend.bind(adminRevenueController)
);

router.get(
  '/plan-performance',
  adminRevenueController.getPlanPerformance.bind(adminRevenueController)
);

router.get(
  '/recent-payments',
  adminRevenueController.getRecentPayments.bind(adminRevenueController)
);

export default router;
