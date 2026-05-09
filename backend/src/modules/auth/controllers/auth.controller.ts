import { Request, Response, NextFunction } from 'express';
import { IRegistrationService } from '../interfaces/service-interfaces/IRegistrationService';
import { ILoginService } from '../interfaces/service-interfaces/ILoginService';
import { IPasswordResetService } from '../interfaces/service-interfaces/IPasswordResetService';
import { IGoogleAuthService, GoogleProfile } from '../interfaces/service-interfaces/IGoogleAuthService';

import { IResendOTPService } from '../interfaces/service-interfaces/IResendOTPService';

import { sendSuccess } from '../../../shared/http/response';
import { AppError } from '../../../shared/utils/AppError';
import { STATUS_CODES } from '../../../shared/constants/status';
import { AUTH_MESSAGES } from '../constants/auth.messages';
import { logger } from '../../../shared/utils/Logger';
import { StartRegistrationDTO, VerifyRegistrationDTO } from '../dtos/AuthDTO';
import { LoginDTO } from '../dtos/LoginDTO';
import { ResetPasswordDTO } from '../dtos/ResetPasswordDTO';
import { ForgotPasswordDTO } from '../dtos/ForgotPasswordDTO';

import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../../../shared/utils/cookies/set-auth-cookie';
import { appConfig } from '../../../config/appConfig';
import { FRONTEND_ROUTES } from '../../../shared/constants/frontend-routes';

export class AuthController {
  constructor(
    private registrationService: IRegistrationService,
    private resendOTPService: IResendOTPService,

    private loginService: ILoginService,
    private passwordResetService: IPasswordResetService,
    private googleAuthService: IGoogleAuthService,
  ) { }

  async startRegistration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: StartRegistrationDTO = req.body;
      await this.registrationService.startRegistration(input);
      sendSuccess(res, { statusCode: STATUS_CODES.OK, message: AUTH_MESSAGES.OTP_SENT });
    } catch (error) {
      next(error);
    }
  }

  async verifyRegistration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: VerifyRegistrationDTO = req.body;
      await this.registrationService.verifyRegistration(input);
      sendSuccess(res, { statusCode: STATUS_CODES.CREATED, message: AUTH_MESSAGES.REGISTER_SUCCESS });
    } catch (error) {
      next(error);
    }
  }

  async resendOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.resendOTPService.resend(req.body.email);
      sendSuccess(res, { statusCode: STATUS_CODES.OK, message: AUTH_MESSAGES.OTP_SENT });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: LoginDTO = req.body;
      const { accessToken, refreshToken } = await this.loginService.login(input);

      setRefreshTokenCookie(res, refreshToken);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: AUTH_MESSAGES.LOGIN_SUCCESS,
        data: { accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await this.loginService.refresh({ refreshToken });

      setRefreshTokenCookie(res, newRefreshToken);

      sendSuccess(res, { statusCode: STATUS_CODES.OK, data: { accessToken } });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) await this.loginService.logout(refreshToken);

      clearRefreshTokenCookie(res);

      sendSuccess(res, { statusCode: STATUS_CODES.OK, message: AUTH_MESSAGES.LOGOUT_SUCCESS });
    } catch (error) {
      next(error);
    }
  }

  googleAuth(_req: Request, _res: Response, _next: NextFunction): void { }

  async googleCallback(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const profile = req.user as GoogleProfile;

      const { accessToken, refreshToken } =
        await this.googleAuthService.authenticateGoogleUser(profile);

      setRefreshTokenCookie(res, refreshToken);

      res.redirect(`${appConfig.frontendUrl}${FRONTEND_ROUTES.GOOGLE_SUCCESS}?token=${accessToken}`);
    } catch (error: unknown) {
      logger.error('[GoogleCallback] Error', error);

      if (error instanceof AppError && error.message === AUTH_MESSAGES.USER_BLOCKED) {
        res.redirect(`${appConfig.frontendUrl}${FRONTEND_ROUTES.LOGIN}?error=account_blocked`);
        return;
      }
      res.redirect(`${appConfig.frontendUrl}${FRONTEND_ROUTES.LOGIN}?error=google_auth_failed`);
    }
  }

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
