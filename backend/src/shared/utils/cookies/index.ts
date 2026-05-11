import { Response } from "express";
import { appConfig } from "../../../config/appConfig";

export const refreshCookieOptions = {
  httpOnly: appConfig.cookies.httpOnly,
  secure: appConfig.cookies.secure,
  sameSite: appConfig.cookies.sameSite,
  maxAge: appConfig.cookies.maxAge,
};

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
