import { appConfig } from "../config/appConfig";

export const REFRESH_TOKEN_EXPIRY = appConfig.jwt.refreshExpiry;
export const ACCESS_TOKEN_EXPIRY = appConfig.jwt.accessExpiry;
