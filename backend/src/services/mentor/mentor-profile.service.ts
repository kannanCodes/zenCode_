import { IMentorProfileService } from "../../interfaces/service-interfaces/mentor/IMentorProfileService";
import { IMentorProfileRepository } from "../../interfaces/repository-interfaces/mentor/IMentorProfileRepository";
import {
  GenerateAvatarUploadUrlInput,
  GenerateAvatarUploadUrlResponse,
  MentorProfileResponse,
  UpdateMentorProfileInput,
} from "../../dtos/mentor/mentor-profile.dto";
import { IUser } from "../../infrastructure/database/models/user.model";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import { MENTOR_MESSAGES, STORAGE_MESSAGES } from "../../constants/messages";
import { MENTOR_DEFAULT_BIO, MENTOR_DEFAULT_TITLE } from "../../constants/mentor.constants";
import { IStorageService } from "../../interfaces/infrastructure-interfaces/storage/IStorageService";
import { appConfig } from "../../config/appConfig";
import { STORAGE_CONSTANTS } from "../../constants/storage.constants";
import crypto from "crypto";
import path from "path";

const mapProfile = (mentor: IUser): MentorProfileResponse => ({
  id: mentor.id,
  fullName: mentor.fullName,
  email: mentor.email,
  avatarUrl: mentor.avatarUrl,
  title: mentor.mentorTitle || (mentor.experienceLevel ? `${mentor.experienceLevel.charAt(0).toUpperCase() + mentor.experienceLevel.slice(1)} Engineer` : MENTOR_DEFAULT_TITLE),
  bio: mentor.mentorBio || MENTOR_DEFAULT_BIO,
  expertise: mentor.expertise || [],
  experienceLevel: mentor.experienceLevel,
});

export class MentorProfileService implements IMentorProfileService {
  constructor(
    private readonly mentorProfileRepository: IMentorProfileRepository,
    private readonly storageService: IStorageService
  ) {}

  async getMyProfile(mentorId: string): Promise<MentorProfileResponse | null> {
    const mentor = await this.mentorProfileRepository.findMentorProfileById(mentorId);
    if (!mentor) {
      return null;
    }

    return mapProfile(mentor);
  }

  async updateMyProfile(mentorId: string, data: UpdateMentorProfileInput): Promise<MentorProfileResponse | null> {
    const mentor = await this.mentorProfileRepository.updateMentorProfile(mentorId, data);
    if (!mentor) {
      throw new AppError(MENTOR_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    return mapProfile(mentor);
  }

  async generateAvatarUploadUrl(
    mentorId: string,
    data: GenerateAvatarUploadUrlInput
  ): Promise<GenerateAvatarUploadUrlResponse> {
    const mentor = await this.mentorProfileRepository.findMentorProfileById(mentorId);
    if (!mentor) {
      throw new AppError(MENTOR_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    if (!STORAGE_CONSTANTS.ALLOWED_AVATAR_MIME_TYPES.includes(data.contentType as (typeof STORAGE_CONSTANTS.ALLOWED_AVATAR_MIME_TYPES)[number])) {
      throw new AppError(STORAGE_MESSAGES.AVATAR_CONTENT_TYPE_INVALID, STATUS_CODES.BAD_REQUEST);
    }

    if (data.fileSizeBytes > STORAGE_CONSTANTS.AVATAR_MAX_FILE_SIZE_BYTES) {
      throw new AppError(STORAGE_MESSAGES.AVATAR_FILE_TOO_LARGE, STATUS_CODES.BAD_REQUEST);
    }

    const extension = path.extname(data.fileName).toLowerCase() || ".jpg";
    const objectKey = `${STORAGE_CONSTANTS.AVATAR_KEY_PREFIX}/${mentorId}/${crypto.randomUUID()}${extension}`;
    const expiresInSeconds = appConfig.s3.avatarUploadUrlExpirySeconds;
    const { uploadUrl } = await this.storageService.generateUploadUrl({
      objectKey,
      contentType: data.contentType,
      expiresInSeconds,
    });

    return {
      uploadUrl,
      fileUrl: `https://${appConfig.s3.bucket}.s3.${appConfig.s3.region}.amazonaws.com/${objectKey}`,
      expiresInSeconds,
      objectKey,
    };
  }
}
