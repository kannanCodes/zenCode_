export interface AdminSessionListDto {
  id: string;
  roomId: string;
  candidateName: string;
  mentorName: string;
  problemTitle: string | null;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
}

export interface AdminSessionTimelineEventDto {
  id: string;
  type: 'scheduled' | 'candidate_joined' | 'mentor_joined' | 'started' | 'disconnected' | 'reconnected' | 'ended';
  timestamp: string;
  actor?: string;
  description: string;
}

export interface AdminSessionDetailsDto {
  id: string;
  roomId: string;
  candidate: {
    id: string;
    name: string;
    email: string;
  };
  mentor: {
    id: string;
    name: string;
    email: string;
  };
  problem: {
    id: string;
    title: string;
  } | null;
  status: string;
  timing: {
    scheduledStart: string;
    scheduledEnd: string;
    startedAt: string | null;
    endedAt: string | null;
    actualDurationMinutes: number | null;
  };
  timeline: AdminSessionTimelineEventDto[];
}

export interface AdminSessionPaginatedResponse {
  sessions: AdminSessionListDto[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}
