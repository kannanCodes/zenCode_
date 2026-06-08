import dotenv from "dotenv";
import { STORAGE_CONSTANTS } from "../constants/storage.constants";

dotenv.config();

export const appConfig = {
  port: Number(process.env.PORT || 5001),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI as string,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5001',
  redis: {
    url: process.env.REDIS_URL || undefined,
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL as string,
  },
  cookies: {
    httpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: (process.env.COOKIE_SAME_SITE || 'strict') as
      'strict' | 'lax' | 'none',
    maxAge: Number(process.env.COOKIE_MAX_AGE || 604800000),
  },
  otp: {
    min: Number(process.env.OTP_MIN || 100000),
    max: Number(process.env.OTP_MAX || 999999),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY as string,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET as string,
  },
  s3: {
    region: process.env.AWS_S3_REGION || process.env.AWS_REGION || "",
    bucket: process.env.AWS_S3_BUCKET || process.env.AWS_BUCKET_NAME || "",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    avatarUploadUrlExpirySeconds: Number(process.env.AWS_AVATAR_UPLOAD_URL_EXPIRY_SECONDS || STORAGE_CONSTANTS.AVATAR_UPLOAD_URL_EXPIRY_SECONDS),
  },
};
