import { Router } from 'express';
import { adminAuthController } from '../../shared/di/admin.container';
import { validateRequest } from '../../middlewares/validate.middleware';
import { adminLoginSchema } from '../../validators/admin/admin-auth.validator';

const router = Router();

router.post(
  '/login',
  validateRequest(adminLoginSchema),
  adminAuthController.login.bind(adminAuthController)
);

router.post('/refresh', adminAuthController.refresh.bind(adminAuthController));

router.post('/logout', adminAuthController.logout.bind(adminAuthController));

export default router;
