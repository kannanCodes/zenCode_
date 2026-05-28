import { AdminAuthRepository } from "../../repositories/admin/AdminAuthRepository";
import { AdminAuthService } from "../../services/admin/AdminAuthService";
import { AdminAuthController } from "../../controllers/admin/AdminAuthController";
import { AdminUserRepository } from "../../repositories/admin/AdminUserRepository";
import { AdminUserService } from "../../services/admin/AdminUserService";
import { AdminUserController } from "../../controllers/admin/AdminUserController";
import { AdminMentorRepository } from "../../repositories/admin/AdminMentorRepository";
import { AdminMentorService } from "../../services/admin/AdminMentorService";
import { AdminMentorController } from "../../controllers/admin/AdminMentorController";
import { cacheService, tokenService, emailService, passwordService, tokenLifecycleRepository } from "./shared.container";
import { stripeService, planRepository } from "./payment.container";
import { PlanService } from "../../services/admin/PlanService";
import { AdminPlanController } from "../../controllers/admin/AdminPlanController";
import { AdminDashboardRepository } from "../../repositories/admin/AdminDashboardRepository";
import { AdminDashboardService } from "../../services/admin/AdminDashboardService";
import { AdminDashboardController } from "../../controllers/admin/AdminDashboardController";
import { IAdminAuthService } from "../../interfaces/service-interfaces/admin/IAdminAuthService";

// ── Repositories ───────────────────────────────────────────────────────────────
export const adminAuthRepository = new AdminAuthRepository();
export const adminUserRepository = new AdminUserRepository();
export const adminMentorRepository = new AdminMentorRepository();

// ── Domain Services ────────────────────────────────────────────────────────────
export const adminAuthService: IAdminAuthService = new AdminAuthService(
  adminAuthRepository,
  cacheService,
  tokenService,
  passwordService
);

export const adminUserService = new AdminUserService(adminUserRepository);

export const adminMentorService = new AdminMentorService(
  adminMentorRepository,
  emailService,
  tokenLifecycleRepository
);

export const planService = new PlanService(
  planRepository,
  stripeService
);

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const adminDashboardRepository = new AdminDashboardRepository();
export const adminDashboardService = new AdminDashboardService(adminDashboardRepository);
export const adminDashboardController = new AdminDashboardController(adminDashboardService);

// ── Controller ─────────────────────────────────────────────────────────────────
export const adminAuthController = new AdminAuthController(adminAuthService);
export const adminUserController = new AdminUserController(adminUserService);
export const adminMentorController = new AdminMentorController(adminMentorService);
export const adminPlanController = new AdminPlanController(planService);
