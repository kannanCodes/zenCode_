import { Response } from 'express';
import { refreshCookieOptions } from './cookie-options';

export const setRefreshTokenCookie = (
  res: Response,
  token: string,
): void => {
  res.cookie(
    'refreshToken',
    token,
    refreshCookieOptions,
  );
};
