import { Response } from 'express';
import { refreshCookieOptions } from './cookie-options';

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: refreshCookieOptions.httpOnly,
    sameSite: refreshCookieOptions.sameSite,
    secure: refreshCookieOptions.secure,
  });
};
