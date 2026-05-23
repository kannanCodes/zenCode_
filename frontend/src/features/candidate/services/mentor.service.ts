import api from '../../../shared/lib/axios';

export interface PublicMentorAvailability {
  nextAvailableSlot?: string;
  timezone: string;
}

export interface PublicMentorStats {
  totalSessions: number;
  rating?: number;
}

export interface PublicMentorResponse {
  id: string;
  name: string;
  avatar?: string;
  title?: string;
  bio?: string;
  expertise: string[];
  yearsOfExperience?: number;
  availabilityPreview: PublicMentorAvailability;
  stats: PublicMentorStats;
}

export const candidateMentorApi = {
  getMentors: async (): Promise<{ data: PublicMentorResponse[] }> => {
    const response = await api.get('/candidates/mentors');
    return response.data;
  },

  getMentorDetails: async (mentorId: string): Promise<{ data: PublicMentorResponse }> => {
    const response = await api.get(`/candidates/mentors/${mentorId}`);
    return response.data;
  },

  getMentorAvailability: async (mentorId: string): Promise<{ data: any }> => {
    // using 'any' temporarily to map to the IMentorAvailability shape
    const response = await api.get(`/candidates/mentors/${mentorId}/availability`);
    return response.data;
  },
};
