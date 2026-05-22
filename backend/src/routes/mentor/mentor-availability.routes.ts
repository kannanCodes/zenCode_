import { Router } from "express";
import { mentorAvailabilityController } from "../../shared/di/mentor.container";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleGuard } from "../../middlewares/role.middleware";
import { UserRole } from "../../shared/constants/roles";
import { validateRequest } from "../../middlewares/validate.middleware";
import { upsertAvailabilityValidator } from "../../validators/mentor/upsert-availability.validator";

const router = Router();

router.put(
  "/",
  authMiddleware,
  roleGuard(UserRole.MENTOR),
  validateRequest(upsertAvailabilityValidator),
  mentorAvailabilityController.upsertAvailability
);

router.get(
  "/me",
  authMiddleware,
  roleGuard(UserRole.MENTOR),
  mentorAvailabilityController.getMyAvailability
);

router.get(
  "/:mentorId",
  authMiddleware,
  mentorAvailabilityController.getMentorAvailability
);

export default router;
