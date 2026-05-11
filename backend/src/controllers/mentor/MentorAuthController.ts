import { Request, Response, NextFunction } from 'express';
import { IMentorAuthService } from "../../interfaces/service-interfaces/mentor/IMentorAuthService";
import { sendSuccess } from "../../shared/http/response";
import { STATUS_CODES } from "../../shared/constants/status";
import { AUTH_MESSAGES } from "../../constants/messages";
import { AppError } from "../../shared/utils/AppError";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../../shared/utils/cookies";

export class MentorAuthController {
  constructor(private readonly _mentorAuthService: IMentorAuthService) {}

  async activate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this._mentorAuthService.activateMentor(req.body);
      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: 'Mentor account activated successfully',
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
        message: 'Mentor login successful',
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
}
