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

export interface MentorListQuery {
  search?: string;
  skills?: string[];
  page?: number;
  limit?: number;
}

export interface PaginatedMentorsResponse {
  data: PublicMentorResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const candidateMentorApi = {
  getMentors: async (query: MentorListQuery = {}): Promise<PaginatedMentorsResponse> => {
    const { skills, ...rest } = query;
    const response = await api.get('/candidates/mentors', {
      params: {
        ...rest,
        ...(skills && skills.length > 0
          ? { skills: skills.join(',') }
          : {}),
      },
    });
    return response.data.data;
  },

  getMentorSkills: async (): Promise<string[]> => {
    const response = await api.get('/candidates/mentors/skills');
    return response.data.data;
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
