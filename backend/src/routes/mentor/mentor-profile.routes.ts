import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleGuard } from "../../middlewares/role.middleware";
import { UserRole } from "../../shared/constants/roles";
import { validateRequest } from "../../middlewares/validate.middleware";
import {
  generateAvatarUploadUrlValidator,
  updateMentorProfileValidator,
} from "../../validators/mentor/mentor-profile.validator";
import { mentorProfileController } from "../../shared/di/mentor.container";

const router = Router();

router.get(
  "/me",
  authMiddleware,
  roleGuard(UserRole.MENTOR),
  mentorProfileController.getMyProfile
);

router.put(
  "/me",
  authMiddleware,
  roleGuard(UserRole.MENTOR),
  validateRequest(updateMentorProfileValidator),
  mentorProfileController.updateMyProfile
);

router.post(
  "/avatar/upload-url",
  authMiddleware,
  roleGuard(UserRole.MENTOR),
  validateRequest(generateAvatarUploadUrlValidator),
  mentorProfileController.generateAvatarUploadUrl
);

export default router;
