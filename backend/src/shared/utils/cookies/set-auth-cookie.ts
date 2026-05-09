import { Response } from "express";
import { refreshCookieOptions } from "./cookie-options";

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie("refreshToken", token, refreshCookieOptions);
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie("refreshToken", {
    httpOnly: refreshCookieOptions.httpOnly,
    secure: refreshCookieOptions.secure,
    sameSite: refreshCookieOptions.sameSite,
  });
};
