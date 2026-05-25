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

export interface ListCandidateMentorsQuery {
  search?: string;
  skills?: string[];
  page: number;
  limit: number;
}

export interface PaginatedPublicMentorsResponse {
  data: PublicMentorResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
