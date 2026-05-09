import { AuthRepository } from '../../modules/auth/repositories/auth.repository';
import { OTPRepository } from '../../modules/auth/repositories/otp.repository';
import { OTPService } from '../../modules/auth/services/otp.service';
import { RegistrationService } from '../../modules/auth/services/registration.service';
import { ResendOTPService } from '../../modules/auth/services/resend-otp.service';
import { LoginService } from '../../modules/auth/services/login.service';
import { GoogleAuthService } from '../../modules/auth/services/google-auth.service';
import { PasswordResetService } from '../../modules/auth/services/password-reset.service';
import { TokenService } from '../services/token.service';

import { EmailService } from '../../infrastructure/email/email.service';
import { ICacheService } from '../interfaces/cache-service.interface';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { InMemoryCacheService } from '../../infrastructure/cache/in-memory-cache.service';
import { AuthController } from '../../modules/auth/controllers/auth.controller';

// ── Shared utilities ───────────────────────────────────────────────────────────
export const cacheService: ICacheService = process.env.NODE_ENV === 'test' 
  ? new InMemoryCacheService() 
  : new CacheService();

const emailService = new EmailService();
export const tokenService = new TokenService();

// ── Repositories ───────────────────────────────────────────────────────────────
export const authRepository = new AuthRepository();
const otpRepo = new OTPRepository(cacheService);

// ── Shared Services ────────────────────────────────────────────────────────────
const otpService = new OTPService(cacheService);

// ── Domain Services ────────────────────────────────────────────────────────────
const registrationService = new RegistrationService(authRepository, otpService, emailService);
const resendOTPService    = new ResendOTPService(otpService, otpRepo, emailService);
const loginService        = new LoginService(authRepository, cacheService, tokenService);
const googleAuthService   = new GoogleAuthService(authRepository, cacheService, tokenService);

const passwordResetService = new PasswordResetService(authRepository, emailService, cacheService);

// ── Controller ─────────────────────────────────────────────────────────────────
export const authController = new AuthController(
  registrationService,
  resendOTPService,
  loginService,
  passwordResetService,
  googleAuthService,
);
