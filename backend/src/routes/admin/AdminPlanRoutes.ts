import { Router } from 'express';
import { adminPlanController } from '../../shared/di/admin.container';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleGuard } from '../../middlewares/role.middleware';
import { UserRole } from '../../shared/constants/roles';
import { validateRequest } from '../../middlewares/validate.middleware';
import { createPlanValidator, updatePlanValidator } from '../../validators/admin/admin-plan.validator';

const router = Router();

// PUBLIC
router.get('/', adminPlanController.getActivePlans);

// ADMIN ONLY
router.use(authMiddleware, roleGuard(UserRole.ADMIN));

router.post(
  '/',
  validateRequest(createPlanValidator),
  adminPlanController.createPlan
);

router.patch(
  '/:id',
  validateRequest(updatePlanValidator),
  adminPlanController.updatePlan
);

router.patch(
  '/:id/toggle-status',
  adminPlanController.togglePlanStatus
);

router.get(
  '/admin',
  adminPlanController.getAdminPlans
);

export default router;
