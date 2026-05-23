import {
  GenerateAvatarUploadUrlInput,
  GenerateAvatarUploadUrlResponse,
  MentorProfileResponse,
  UpdateMentorProfileInput,
} from "../../../dtos/mentor/mentor-profile.dto";

export interface IMentorProfileService {
  getMyProfile(mentorId: string): Promise<MentorProfileResponse | null>;
  updateMyProfile(mentorId: string, data: UpdateMentorProfileInput): Promise<MentorProfileResponse | null>;
  generateAvatarUploadUrl(mentorId: string, data: GenerateAvatarUploadUrlInput): Promise<GenerateAvatarUploadUrlResponse>;
}
