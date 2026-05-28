import { Router } from 'express';
import { adminDashboardController } from '../../shared/di/admin.container';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleGuard } from '../../middlewares/role.middleware';
import { UserRole } from '../../shared/constants/roles';

const router = Router();

router.use(authMiddleware, roleGuard(UserRole.ADMIN));

router.get(
  '/dashboard/stats',
  adminDashboardController.getStats.bind(adminDashboardController),
);

router.get(
  '/dashboard/activity',
  adminDashboardController.getActivityFeed.bind(adminDashboardController),
);

router.get(
  '/dashboard/analytics',
  adminDashboardController.getAnalytics.bind(adminDashboardController),
);

router.get(
  '/dashboard/pending-actions',
  adminDashboardController.getPendingActions.bind(adminDashboardController),
);

export default router;
