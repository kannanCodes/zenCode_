import { Request, Response, NextFunction } from 'express';
import { IMentorAuthService } from "../../interfaces/service-interfaces/mentor/IMentorAuthService";
import { sendSuccess } from "../../shared/http/response";
import { STATUS_CODES } from "../../shared/constants/status";
import { AUTH_MESSAGES, MENTOR_MESSAGES } from "../../constants/messages";
import { AppError } from "../../shared/utils/AppError";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../../shared/utils/cookies";

export class MentorAuthController {
  constructor(private readonly _mentorAuthService: IMentorAuthService) {}

  async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this._mentorAuthService.activateMentor(req.body);
      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: MENTOR_MESSAGES.ACTIVATED,
      });
    } catch (error) {
      next(error);
    }
  }

  async validateActivationToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        throw new AppError(AUTH_MESSAGES.TOKEN_REQUIRED, STATUS_CODES.BAD_REQUEST);
      }

      const valid = await this._mentorAuthService.validateActivationToken(token);
      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        data: { valid },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accessToken, refreshToken } = await this._mentorAuthService.login(req.body);

      setRefreshTokenCookie(res, refreshToken);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: MENTOR_MESSAGES.LOGIN_SUCCESS,
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

      const { accessToken, refreshToken: newRefreshToken } = await this._mentorAuthService.refresh(refreshToken);

      setRefreshTokenCookie(res, newRefreshToken);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        data: { accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        await this._mentorAuthService.logout(refreshToken);
      }

      clearRefreshTokenCookie(res);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: AUTH_MESSAGES.LOGOUT_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await this._mentorAuthService.forgotPassword(email);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: AUTH_MESSAGES.PASSWORD_RESET_LINK_SENT,
      });
    } catch (error) {
      // In a real application, you might want to return success even if the email is not found
      // to prevent email enumeration. However, to match the requested error behavior:
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this._mentorAuthService.resetPassword(req.body);

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

      const valid = await this._mentorAuthService.validateResetToken(token);
      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        data: { valid },
      });
    } catch (error) {
      next(error);
    }
  }
}
