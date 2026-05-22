import { Router } from "express";
import { mentorSlotController } from "../../shared/di/mentor.container";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate.middleware";
import { getSlotsValidator } from "../../validators/mentor/get-slots.validator";

const router = Router();

router.get(
  "/:mentorId",
  authMiddleware,
  validateRequest(getSlotsValidator),
  mentorSlotController.getMentorSlots
);

export default router;
