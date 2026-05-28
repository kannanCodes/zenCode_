import { Router } from 'express';
import { adminSessionController } from '../../shared/di/admin.container';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleGuard } from '../../middlewares/role.middleware';
import { UserRole } from '../../shared/constants/roles';

const router = Router();

router.use(authMiddleware, roleGuard(UserRole.ADMIN));

router.get(
  '/sessions',
  adminSessionController.getSessions.bind(adminSessionController)
);

router.get(
  '/sessions/:id',
  adminSessionController.getSessionDetails.bind(adminSessionController)
);

export default router;
