import { CreateBookingInput } from "../../../dtos/mentor/create-booking.dto";
import { IMentorBooking } from "../../../infrastructure/database/models/mentor-booking.model";

export interface MentorDashboardStats {
  upcomingCount: number;
  todayCount: number;
  totalSessions: number;
  activeStudents: number;
  completionRate: number;
}

export interface IMentorBookingService {
  createBooking(studentId: string, data: CreateBookingInput): Promise<IMentorBooking>;
  getMyBookings(studentId: string): Promise<IMentorBooking[]>;
  getMentorBookings(mentorId: string): Promise<IMentorBooking[]>;
  cancelBooking(bookingId: string, userId: string): Promise<IMentorBooking | null>;
  getDashboardStats(mentorId: string): Promise<MentorDashboardStats>;
  getUpcomingBookings(mentorId: string, limit: number): Promise<IMentorBooking[]>;
}
