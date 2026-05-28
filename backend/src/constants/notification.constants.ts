export const NOTIFICATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  TTL_DAYS: 90,                           // read notifications auto-expire after 90 days
  TTL_SECONDS: 90 * 24 * 60 * 60,        // 7_776_000
} as const;
