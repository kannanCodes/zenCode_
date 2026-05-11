import { Router } from 'express';
import { adminUserController } from '../../shared/di/admin.container';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleGuard } from '../../middlewares/role.middleware';
import { UserRole } from '../../shared/constants/roles';
import { validateQuery } from '../../middlewares/validate.middleware';
import { listUsersSchema } from '../../validators/admin/admin-user.validator';

const router = Router();

router.use(authMiddleware, roleGuard(UserRole.ADMIN));

router.get(
  '/users',
  validateQuery(listUsersSchema),
  adminUserController.listUsers.bind(adminUserController)
);

router.patch(
  '/users/:userId/block',
  adminUserController.blockUser.bind(adminUserController)
);

router.patch(
  '/users/:userId/unblock',
  adminUserController.unblockUser.bind(adminUserController)
);

export default router;
