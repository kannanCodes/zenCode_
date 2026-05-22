import { BaseRepository } from "../../infrastructure/database/repositories/base/base.repository";
import { IMentorBooking, MentorBooking } from "../../infrastructure/database/models/mentor-booking.model";
import { IMentorBookingRepository } from "../../interfaces/repository-interfaces/mentor/IMentorBookingRepository";
import { CreateBookingInput } from "../../dtos/mentor/create-booking.dto";
import { BookingStatus } from "../../constants/booking-status";
import { Types } from "mongoose";

export class MentorBookingRepository extends BaseRepository<IMentorBooking> implements IMentorBookingRepository {
  constructor() {
    super(MentorBooking);
  }

  async createBooking(studentId: string, data: CreateBookingInput): Promise<IMentorBooking> {
    return this.create({
      mentorId: new Types.ObjectId(data.mentorId),
      studentId: new Types.ObjectId(studentId),
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      status: BookingStatus.CONFIRMED,
    });
  }

  async getStudentBookings(studentId: string): Promise<IMentorBooking[]> {
    return this.model
      .find({ studentId })
      .populate("mentorId", "name email")
      .sort({ startTime: -1 })
      .exec();
  }

  async getMentorBookings(mentorId: string): Promise<IMentorBooking[]> {
    return this.model
      .find({ mentorId })
      .populate("studentId", "name email")
      .sort({ startTime: -1 })
      .exec();
  }

  async cancelBooking(bookingId: string, userId: string, reason?: string): Promise<IMentorBooking | null> {
    return this.model.findByIdAndUpdate(
      bookingId,
      {
        status: BookingStatus.CANCELLED,
        cancelledBy: new Types.ObjectId(userId),
        cancelReason: reason,
      },
      { new: true }
    ).exec();
  }
}
