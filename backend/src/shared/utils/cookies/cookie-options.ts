import { appConfig } from "../../../config/appConfig";

export const refreshCookieOptions = {
  httpOnly: appConfig.cookies.httpOnly,
  secure: appConfig.cookies.secure,
  sameSite: appConfig.cookies.sameSite,
  maxAge: appConfig.cookies.maxAge,
};
