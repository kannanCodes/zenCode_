import { MentorSessionStatus } from '../../constants/session-status';

export interface AdminSessionListDto {
  id: string;
  roomId: string;
  candidateName: string;
  mentorName: string;
  problemTitle: string | null;
  status: MentorSessionStatus;
  scheduledStart: string;
  scheduledEnd: string;
}

export interface AdminSessionTimelineEventDto {
  id: string;
  type: 'scheduled' | 'candidate_joined' | 'mentor_joined' | 'started' | 'disconnected' | 'reconnected' | 'ended';
  timestamp: string;
  actor?: string; // e.g., candidate name or mentor name, or "System"
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
  status: MentorSessionStatus;
  timing: {
    scheduledStart: string;
    scheduledEnd: string;
    startedAt: string | null;
    endedAt: string | null;
    actualDurationMinutes: number | null;
  };
  timeline: AdminSessionTimelineEventDto[];
}

export interface AdminSessionQueryDto {
  page?: number;
  limit?: number;
  status?: MentorSessionStatus | 'ALL';
  search?: string;
}

export interface AdminSessionPaginatedResponse {
  sessions: AdminSessionListDto[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}
