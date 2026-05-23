export interface MentorProfileResponse {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  title?: string;
  bio?: string;
  expertise: string[];
  experienceLevel?: "junior" | "mid" | "senior";
}

export interface UpdateMentorProfileInput {
  fullName?: string;
  avatarUrl?: string;
  title?: string;
  bio?: string;
  expertise?: string[];
  experienceLevel?: "junior" | "mid" | "senior";
}

export interface GenerateAvatarUploadUrlInput {
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
}

export interface GenerateAvatarUploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  expiresInSeconds: number;
  objectKey: string;
}
