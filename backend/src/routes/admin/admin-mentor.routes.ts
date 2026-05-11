import { Router } from 'express';
import { adminMentorController } from '../../shared/di/admin.container';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleGuard } from '../../middlewares/role.middleware';
import { UserRole } from '../../shared/constants/roles';
import { validateRequest, validateQuery } from '../../middlewares/validate.middleware';
import { createMentorSchema, listMentorsQuerySchema } from '../../validators/admin/admin-mentor.validator';

const router = Router();

router.use(authMiddleware, roleGuard(UserRole.ADMIN));

router.post(
  '/mentors',
  validateRequest(createMentorSchema),
  adminMentorController.createMentor.bind(adminMentorController)
);

router.get(
  '/mentors',
  validateQuery(listMentorsQuerySchema),
  adminMentorController.listMentors.bind(adminMentorController)
);

router.patch(
  '/mentors/:mentorId/status',
  adminMentorController.updateMentorStatus.bind(adminMentorController)
);

router.post(
  '/mentors/:mentorId/resend-invite',
  adminMentorController.resendMentorInvite.bind(adminMentorController)
);

export default router;
