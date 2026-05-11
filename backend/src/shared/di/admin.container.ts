import { AdminAuthRepository } from "../../repositories/admin/AdminAuthRepository";
import { AdminAuthService } from "../../services/admin/AdminAuthService";
import { AdminAuthController } from "../../controllers/admin/AdminAuthController";
import { AdminUserRepository } from "../../repositories/admin/AdminUserRepository";
import { AdminUserService } from "../../services/admin/AdminUserService";
import { AdminUserController } from "../../controllers/admin/AdminUserController";
import { AdminMentorRepository } from "../../repositories/admin/AdminMentorRepository";
import { AdminMentorService } from "../../services/admin/AdminMentorService";
import { AdminMentorController } from "../../controllers/admin/AdminMentorController";
import { cacheService, tokenService, emailService } from "./shared.container";

// ── Repositories ───────────────────────────────────────────────────────────────
export const adminAuthRepository = new AdminAuthRepository();
export const adminUserRepository = new AdminUserRepository();
export const adminMentorRepository = new AdminMentorRepository();

// ── Domain Services ────────────────────────────────────────────────────────────
export const adminAuthService = new AdminAuthService(
  adminAuthRepository,
  cacheService,
  tokenService
);

export const adminUserService = new AdminUserService(adminUserRepository);

export const adminMentorService = new AdminMentorService(
  adminMentorRepository,
  emailService,
  cacheService
);

// ── Controller ─────────────────────────────────────────────────────────────────
export const adminAuthController = new AdminAuthController(adminAuthService);
export const adminUserController = new AdminUserController(adminUserService);
export const adminMentorController = new AdminMentorController(adminMentorService);
