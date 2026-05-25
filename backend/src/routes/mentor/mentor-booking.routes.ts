import { Router } from "express";
import { mentorBookingController } from "../../shared/di/mentor.container";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleGuard } from "../../middlewares/role.middleware";
import { UserRole } from "../../shared/constants/roles";
import { validateRequest } from "../../middlewares/validate.middleware";
import { createBookingValidator } from "../../validators/mentor/create-booking.validator";
import { subscriptionMiddleware } from "../../shared/di/payment.container";

const router = Router();

/**
 * student create booking
 */
router.post(
  "/",
  authMiddleware,
  roleGuard(UserRole.CANDIDATE),
  subscriptionMiddleware.requireFeatureAccess("mentorBooking"),
  validateRequest(createBookingValidator),
  mentorBookingController.createBooking
);

/**
 * student bookings
 */
router.get(
  "/my",
  authMiddleware,
  roleGuard(UserRole.CANDIDATE),
  mentorBookingController.getMyBookings
);

/**
 * mentor bookings
 */
router.get(
  "/mentor",
  authMiddleware,
  roleGuard(UserRole.MENTOR),
  mentorBookingController.getMentorBookings
);

/**
 * cancel booking
 */
router.patch(
  "/:id/cancel",
  authMiddleware,
  mentorBookingController.cancelBooking
);

export default router;
