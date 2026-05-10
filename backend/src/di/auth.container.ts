import { AuthRepository } from '../repositories/auth/AuthRepository';
import { OTPRepository } from '../repositories/auth/OTPRepository';
import { OTPService } from '../services/auth/OTPService';
import { RegistrationService } from '../services/auth/RegistrationService';
import { ResendOTPService } from '../services/auth/ResendOTPService';
import { LoginService } from '../services/auth/LoginService';
import { GoogleAuthService } from '../services/auth/GoogleAuthService';
import { PasswordResetService } from '../services/auth/PasswordResetService';
import { AuthController } from '../controllers/auth/AuthController';
import { cacheService, emailService, tokenService } from './shared.container';


// ── Repositories ───────────────────────────────────────────────────────────────
export const authRepository = new AuthRepository();
const otpRepo = new OTPRepository(cacheService);

// ── Domain Services ────────────────────────────────────────────────────────────
const otpService = new OTPService(cacheService);
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