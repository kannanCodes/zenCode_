export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'expired';

export interface BookingUser {
  _id: string;
  fullName?: string;
  email: string;
  avatarUrl?: string;
}

export interface MentorBooking {
  _id: string;
  mentorId: BookingUser | null;
  studentId: BookingUser | null;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: BookingStatus;
  cancelledBy?: string;
  cancelReason?: string;
  notes?: string;
  createdAt: string;
}

export interface MentorSession {
  _id: string;
  bookingId: string;
  roomId: string;
  mentorId: string;
  studentId: string;
  status: "SCHEDULED" | "WAITING" | "ACTIVE" | "ENDED" | "NO_SHOW" | "ABANDONED" | "EXPIRED" | "CANCELLED";
  scheduledStart: string;
  scheduledEnd: string;
  startedAt?: string;
  endedAt?: string;
  mentorOnline: boolean;
  studentOnline: boolean;
}
