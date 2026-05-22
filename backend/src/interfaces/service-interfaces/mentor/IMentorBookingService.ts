import { CreateBookingInput } from "../../../dtos/mentor/create-booking.dto";
import { IMentorBooking } from "../../../infrastructure/database/models/mentor-booking.model";

export interface IMentorBookingService {
  createBooking(studentId: string, data: CreateBookingInput): Promise<IMentorBooking>;
  getMyBookings(studentId: string): Promise<IMentorBooking[]>;
  getMentorBookings(mentorId: string): Promise<IMentorBooking[]>;
  cancelBooking(bookingId: string, userId: string): Promise<IMentorBooking | null>;
}
