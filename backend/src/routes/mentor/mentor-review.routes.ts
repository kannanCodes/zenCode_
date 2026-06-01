import { Router } from "express";
import { mentorReviewController } from "../../shared/di/mentor.container";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleGuard } from "../../middlewares/role.middleware";
import { validateRequest } from "../../middlewares/validate.middleware";
import { UserRole } from "../../shared/constants/roles";
import { createReviewSchema } from "../../validators/mentor/mentor-auth.validator";

const router = Router();

// POST /api/mentor-reviews  → Candidate submits review after session ends
router.post(
  "/",
  authMiddleware,
  roleGuard(UserRole.CANDIDATE),
  validateRequest(createReviewSchema),
  mentorReviewController.createReview
);

// GET /api/mentor-reviews/booking/:bookingId → Check if a booking was already reviewed
router.get(
  "/booking/:bookingId",
  authMiddleware,
  roleGuard(UserRole.CANDIDATE),
  mentorReviewController.getReviewByBooking
);

// GET /api/mentor-reviews/mentor/:mentorId → Anyone can view public reviews of a mentor
router.get(
  "/mentor/:mentorId",
  mentorReviewController.getMentorPublicReviews
);

export default router;
