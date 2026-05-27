import { MentorAuthRepository } from "../../repositories/mentor/MentorAuthRepository";
import { MentorAuthService } from "../../services/mentor/MentorAuthService";
import { MentorAuthController } from "../../controllers/mentor/MentorAuthController";
import { MentorAvailabilityRepository } from "../../repositories/mentor/mentor-availability.repository";
import { MentorAvailabilityService } from "../../services/mentor/mentor-availability.service";
import { MentorAvailabilityController } from "../../controllers/mentor/mentor-availability.controller";
import { MentorSlotService } from "../../services/mentor/mentor-slot.service";
import { MentorSlotController } from "../../controllers/mentor/mentor-slot.controller";
import { MentorBookingRepository } from "../../repositories/mentor/mentor-booking.repository";
import { MentorBookingService } from "../../services/mentor/mentor-booking.service";
import { MentorBookingController } from "../../controllers/mentor/mentor-booking.controller";
import { MentorSessionRepository } from "../../repositories/mentor/mentor-session.repository";
import { MentorSessionService } from "../../services/mentor/mentor-session.service";
import { MentorSessionController } from "../../controllers/mentor/mentor-session.controller";
import { MentorReviewRepository } from "../../repositories/mentor/mentor-review.repository";
import { MentorReviewService } from "../../services/mentor/mentor-review.service";
import { MentorReviewController } from "../../controllers/mentor/mentor-review.controller";
import { MentorProfileRepository } from "../../repositories/mentor/mentor-profile.repository";
import { MentorProfileService } from "../../services/mentor/mentor-profile.service";
import { MentorProfileController } from "../../controllers/mentor/mentor-profile.controller";
import { adminMentorRepository } from "./admin.container";
import { cacheService, tokenService, passwordService, tokenLifecycleRepository, storageService } from "./shared.container";
import { MentorSessionCronJobs } from "../../infrastructure/cron/mentor-session.cron";
import { problemRepository } from "./problem.container";
import { subscriptionService } from "./payment.container";

// ── Repositories ───────────────────────────────────────────────────────────────
export const mentorAuthRepository = new MentorAuthRepository();
export const mentorAvailabilityRepository = new MentorAvailabilityRepository();
export const mentorBookingRepository = new MentorBookingRepository();
export const mentorSessionRepository = new MentorSessionRepository();
export const mentorReviewRepository = new MentorReviewRepository();
export const mentorProfileRepository = new MentorProfileRepository();

// ── Domain Services ────────────────────────────────────────────────────────────
export const mentorAuthService = new MentorAuthService(
  mentorAuthRepository,
  adminMentorRepository,
  cacheService,
  tokenService,
  passwordService,
  tokenLifecycleRepository
);

export const mentorAvailabilityService = new MentorAvailabilityService(
  mentorAvailabilityRepository
);

export const mentorSlotService = new MentorSlotService(
  mentorAvailabilityRepository
);

export const mentorBookingService = new MentorBookingService(
  mentorBookingRepository,
  mentorSlotService
);

export const mentorSessionService = new MentorSessionService(
  mentorSessionRepository,
  mentorBookingRepository,
  problemRepository,
  subscriptionService
);

export const mentorReviewService = new MentorReviewService(
  mentorReviewRepository,
  mentorBookingRepository
);

export const mentorProfileService = new MentorProfileService(
  mentorProfileRepository,
  storageService
);

// ── Cron Jobs ──────────────────────────────────────────────────────────────────
export const mentorSessionCronJobs = new MentorSessionCronJobs(
  mentorSessionService
);

// ── Controller ─────────────────────────────────────────────────────────────────
export const mentorAuthController = new MentorAuthController(mentorAuthService);
export const mentorAvailabilityController = new MentorAvailabilityController(mentorAvailabilityService);
export const mentorSlotController = new MentorSlotController(mentorSlotService);
export const mentorBookingController = new MentorBookingController(mentorBookingService);
export const mentorSessionController = new MentorSessionController(mentorSessionService);
export const mentorReviewController = new MentorReviewController(mentorReviewService);
export const mentorProfileController = new MentorProfileController(mentorProfileService);
