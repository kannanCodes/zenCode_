import api from '../../../shared/lib/axios';
import type {
  AvatarUploadUrlResponse,
  MentorProfile,
  UpdateMentorProfilePayload,
} from '../types/profile';

export const mentorProfileApi = {
  getMyProfile: async (): Promise<{ data: MentorProfile | null }> => {
    const response = await api.get('/mentor/profile/me');
    return response.data;
  },

  updateMyProfile: async (payload: UpdateMentorProfilePayload): Promise<{ data: MentorProfile }> => {
    const response = await api.put('/mentor/profile/me', payload);
    return response.data;
  },

  getAvatarUploadUrl: async (file: File): Promise<{ data: AvatarUploadUrlResponse }> => {
    const response = await api.post('/mentor/profile/avatar/upload-url', {
      fileName: file.name,
      contentType: file.type,
      fileSizeBytes: file.size,
    });
    return response.data;
  },
};
