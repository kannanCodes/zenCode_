import { z } from "zod";
import { MENTOR_PROFILE_LIMITS } from "../../constants/mentor.constants";
import { VALIDATION_MESSAGES } from "../../constants/messages";
import { STORAGE_CONSTANTS } from "../../constants/storage.constants";

export const updateMentorProfileValidator = z.object({
  fullName: z
    .string()
    .trim()
    .min(MENTOR_PROFILE_LIMITS.FULL_NAME_MIN, VALIDATION_MESSAGES.FULL_NAME_MIN)
    .max(MENTOR_PROFILE_LIMITS.FULL_NAME_MAX)
    .optional(),
  avatarUrl: z.string().url().optional(),
  title: z.string().trim().max(MENTOR_PROFILE_LIMITS.TITLE_MAX).optional(),
  bio: z.string().trim().max(MENTOR_PROFILE_LIMITS.BIO_MAX).optional(),
  expertise: z
    .array(z.string().trim().min(1).max(MENTOR_PROFILE_LIMITS.EXPERTISE_ITEM_MAX))
    .max(MENTOR_PROFILE_LIMITS.EXPERTISE_MAX_ITEMS)
    .optional(),
  experienceLevel: z.enum(["junior", "mid", "senior"]).optional(),
});

export const generateAvatarUploadUrlValidator = z.object({
  fileName: z.string().trim().min(1),
  contentType: z.string().trim().min(1),
  fileSizeBytes: z.number().int().positive().max(STORAGE_CONSTANTS.AVATAR_MAX_FILE_SIZE_BYTES),
});
