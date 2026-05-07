import { Request, Response, NextFunction } from 'express';
import { IRegistrationService } from '../interfaces/service-interfaces/IRegistrationService';
import { ILoginService } from '../interfaces/service-interfaces/ILoginService';
import { IPasswordResetService } from '../interfaces/service-interfaces/IPasswordResetService';
import { IGoogleAuthService, GoogleProfile } from '../interfaces/service-interfaces/IGoogleAuthService';

import { IResendOTPService } from '../interfaces/service-interfaces/IResendOTPService';

import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';
import { STATUS_CODES } from '../constants/status';
import { AUTH_MESSAGES } from '../constants/messages';
import { logger } from '../utils/Logger';
import { StartRegistrationDTO, VerifyRegistrationDTO } from '../dtos/AuthDTO';
import { LoginDTO } from '../dtos/LoginDTO';
import { ResetPasswordDTO } from '../dtos/ResetPasswordDTO';
import { ForgotPasswordDTO } from '../dtos/ForgotPasswordDTO';
import { RefreshTokenDTO } from '../dtos/RefreshTokenDTO';



const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  constructor(
    private registrationService: IRegistrationService,
    private resendOTPService: IResendOTPService,

    private loginService: ILoginService,
    private passwordResetService: IPasswordResetService,
    private googleAuthService: IGoogleAuthService,
  ) { }

  // POST /api/auth/register
  async startRegistration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: StartRegistrationDTO = req.body;
      await this.registrationService.startRegistration(input);
      sendSuccess(res, { statusCode: STATUS_CODES.OK, message: AUTH_MESSAGES.OTP_SENT });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/verify-otp
  async verifyRegistration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: VerifyRegistrationDTO = req.body;
      await this.registrationService.verifyRegistration(input);
      sendSuccess(res, { statusCode: STATUS_CODES.CREATED, message: AUTH_MESSAGES.REGISTER_SUCCESS });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/resend-otp
  async resendOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.resendOTPService.resend(req.body.email);
      sendSuccess(res, { statusCode: STATUS_CODES.OK, message: AUTH_MESSAGES.OTP_SENT });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/login
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: LoginDTO = req.body;
      const { accessToken, refreshToken } = await this.loginService.login(input);

      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: AUTH_MESSAGES.LOGIN_SUCCESS,
        data: { accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/refresh
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await this.loginService.refresh({ refreshToken });


      res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

      sendSuccess(res, { statusCode: STATUS_CODES.OK, data: { accessToken } });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/logout
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) await this.loginService.logout(refreshToken);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });

      sendSuccess(res, { statusCode: STATUS_CODES.OK, message: AUTH_MESSAGES.LOGOUT_SUCCESS });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/google — handled by Passport middleware
  googleAuth(_req: Request, _res: Response, _next: NextFunction): void { }

  // GET /api/auth/google/callback
  async googleCallback(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    try {
      const profile = req.user as GoogleProfile;


      const { accessToken, refreshToken } =
        await this.googleAuthService.authenticateGoogleUser(profile);

      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
      res.redirect(`${frontendUrl}/auth/google/success?token=${accessToken}`);
    } catch (error: unknown) {
      logger.error('[GoogleCallback] Error', error);

      if (error instanceof AppError && error.message === AUTH_MESSAGES.USER_BLOCKED) {
        res.redirect(`${frontendUrl}/login?error=account_blocked`);
        return;
      }
      res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }
  }

  // POST /api/auth/forgot-password
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email }: ForgotPasswordDTO = req.body;
      await this.passwordResetService.forgotPassword(email);
      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: AUTH_MESSAGES.PASSWORD_RESET_LINK_SENT,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/reset-password
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: ResetPasswordDTO = req.body;
      await this.passwordResetService.resetPassword(input);
      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/reset-password/validate
  async validateResetToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        throw new AppError(AUTH_MESSAGES.TOKEN_REQUIRED, STATUS_CODES.BAD_REQUEST);
      }

      const isValid = await this.passwordResetService.validateResetToken(token);
      sendSuccess(res, { statusCode: STATUS_CODES.OK, data: { valid: isValid } });
    } catch (error) {
      next(error);
    }
  }
}