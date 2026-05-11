export interface CreateMentorInput {
  fullName: string;
  email: string;
  expertise: string[];
  experienceLevel: 'junior' | 'mid' | 'senior';
}

export interface ListMentorsQuery {
  page: number;
  limit: number;
  status?: 'INVITED' | 'ACTIVE' | 'DISABLED';
  experienceLevel?: 'junior' | 'mid' | 'senior';
  isBlocked?: boolean;
  expertise?: string;
  search?: string;
  sortBy: 'createdAt' | 'invitedAt' | 'activatedAt' | 'experienceLevel' | 'mentorStatus';
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedMentorsResponse {
  data: unknown[]; // Will be IUser[]
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
