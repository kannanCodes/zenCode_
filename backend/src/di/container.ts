import { AuthRepository } from '../repositories/AuthRepository';
import { OTPRepository } from '../repositories/OTPRepository';
import { OTPService } from '../services/OTPService';
import { RegistrationService } from '../services/RegistrationService';
import { ResendOTPService } from '../services/ResendOTPService';
import { LoginService } from '../services/LoginService';
import { GoogleAuthService } from '../services/GoogleAuthService';
import { PasswordResetService } from '../services/PasswordResetService';
import { EmailService } from '../utils/email';
import { ICacheService } from '../interfaces/service-interfaces/ICacheService';
import { CacheService } from '../utils/cache';
import { InMemoryCacheService } from '../utils/InMemoryCacheService';
import { AuthController } from '../controllers/AuthController';

// ── Shared utilities ───────────────────────────────────────────────────────────
export const cacheService: ICacheService = process.env.NODE_ENV === 'test' 
  ? new InMemoryCacheService() 
  : new CacheService();

const emailService = new EmailService();


// ── Repositories ───────────────────────────────────────────────────────────────
export const authRepository = new AuthRepository();
const otpRepo = new OTPRepository(cacheService);

// ── Shared Services ────────────────────────────────────────────────────────────
const otpService = new OTPService(cacheService);

// ── Domain Services ────────────────────────────────────────────────────────────
const registrationService = new RegistrationService(authRepository, otpService, emailService);
const resendOTPService    = new ResendOTPService(otpService, otpRepo, emailService);
const loginService        = new LoginService(authRepository, cacheService);
const googleAuthService   = new GoogleAuthService(authRepository, cacheService);
const passwordResetService = new PasswordResetService(authRepository, emailService, cacheService);

// ── Controller ─────────────────────────────────────────────────────────────────
export const authController = new AuthController(
  registrationService,
  resendOTPService,
  loginService,
  passwordResetService,
  googleAuthService,
);