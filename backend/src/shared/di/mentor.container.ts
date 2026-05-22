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
import { adminMentorRepository } from "./admin.container";
import { cacheService, tokenService, passwordService } from "./shared.container";
import { MentorSessionCronJobs } from "../../cron/mentor-session.cron";

// ── Repositories ───────────────────────────────────────────────────────────────
export const mentorAuthRepository = new MentorAuthRepository();
export const mentorAvailabilityRepository = new MentorAvailabilityRepository();
export const mentorBookingRepository = new MentorBookingRepository();
export const mentorSessionRepository = new MentorSessionRepository();

// ── Domain Services ────────────────────────────────────────────────────────────
export const mentorAuthService = new MentorAuthService(
  mentorAuthRepository,
  adminMentorRepository,
  cacheService,
  tokenService,
  passwordService
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
  mentorSessionRepository
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
