export type MentorExperienceLevel = 'junior' | 'mid' | 'senior';

export interface MentorProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  title?: string;
  bio?: string;
  expertise: string[];
  experienceLevel?: MentorExperienceLevel;
}

export interface UpdateMentorProfilePayload {
  fullName?: string;
  avatarUrl?: string;
  title?: string;
  bio?: string;
  expertise?: string[];
  experienceLevel?: MentorExperienceLevel;
}

export interface AvatarUploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  expiresInSeconds: number;
  objectKey: string;
}
