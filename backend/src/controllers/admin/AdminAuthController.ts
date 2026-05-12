import { Request, Response, NextFunction } from "express";
import { IAdminAuthService } from "../../interfaces/service-interfaces/admin/IAdminAuthService";
import { sendSuccess } from "../../shared/http/response";
import { STATUS_CODES } from "../../shared/constants/status";
import { AppError } from "../../shared/utils/AppError";
import { AUTH_MESSAGES, ADMIN_MESSAGES } from "../../constants/messages";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../../shared/utils/cookies";

export class AdminAuthController {
  constructor(private readonly _adminAuthService: IAdminAuthService) {}

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken } = await this._adminAuthService.login(req.body);

      setRefreshTokenCookie(res, refreshToken);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: ADMIN_MESSAGES.LOGIN_SUCCESS,
        data: { accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
      }

      const { accessToken, refreshToken: newRefreshToken } = await this._adminAuthService.refresh(refreshToken);

      setRefreshTokenCookie(res, newRefreshToken);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        data: { accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        await this._adminAuthService.logout(refreshToken);
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
