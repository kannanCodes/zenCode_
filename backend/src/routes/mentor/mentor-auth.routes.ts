import { Router } from "express";
import { mentorAuthController } from "../../shared/di/mentor.container";
import { validateRequest } from "../../middlewares/validate.middleware";
import { mentorLoginSchema, activateMentorSchema } from "../../validators/mentor/mentor-auth.validator";

const router = Router();

router.post(
  "/activate",
  validateRequest(activateMentorSchema),
  mentorAuthController.activate.bind(mentorAuthController)
);
router.get(
  "/activate/validate",
  mentorAuthController.validateActivationToken.bind(mentorAuthController)
);

router.post(
  "/login",
  validateRequest(mentorLoginSchema),
  mentorAuthController.login.bind(mentorAuthController)
);

router.post("/refresh", mentorAuthController.refresh.bind(mentorAuthController));
router.post("/logout", mentorAuthController.logout.bind(mentorAuthController));

export default router;
