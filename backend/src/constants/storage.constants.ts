export const STORAGE_CONSTANTS = {
  AVATAR_KEY_PREFIX: "mentor-avatars",
  AVATAR_UPLOAD_URL_EXPIRY_SECONDS: 300,
  AVATAR_MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_AVATAR_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"],
} as const;
