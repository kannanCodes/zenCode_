import { MentorAuthRepository } from "../../repositories/mentor/MentorAuthRepository";
import { MentorAuthService } from "../../services/mentor/MentorAuthService";
import { MentorAuthController } from "../../controllers/mentor/MentorAuthController";
import { adminMentorRepository } from "./admin.container";
import { cacheService, tokenService, passwordService } from "./shared.container";

// ── Repositories ───────────────────────────────────────────────────────────────
export const mentorAuthRepository = new MentorAuthRepository();

// ── Domain Services ────────────────────────────────────────────────────────────
export const mentorAuthService = new MentorAuthService(
  mentorAuthRepository,
  adminMentorRepository,
  cacheService,
  tokenService,
  passwordService
);

// ── Controller ─────────────────────────────────────────────────────────────────
export const mentorAuthController = new MentorAuthController(mentorAuthService);
