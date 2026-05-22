import { CreateBookingInput } from "../../../dtos/mentor/create-booking.dto";
import { IMentorBooking } from "../../../infrastructure/database/models/mentor-booking.model";
import { BaseRepository } from "../../../infrastructure/database/repositories/base/base.repository";

export interface IMentorBookingRepository extends BaseRepository<IMentorBooking> {
  createBooking(studentId: string, data: CreateBookingInput): Promise<IMentorBooking>;
  getStudentBookings(studentId: string): Promise<IMentorBooking[]>;
  getMentorBookings(mentorId: string): Promise<IMentorBooking[]>;
  cancelBooking(bookingId: string, userId: string, reason?: string): Promise<IMentorBooking | null>;
}
