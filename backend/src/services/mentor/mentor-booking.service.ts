import { isAfter, differenceInHours } from "date-fns";
import { IMentorBookingService } from "../../interfaces/service-interfaces/mentor/IMentorBookingService";
import { IMentorBookingRepository } from "../../interfaces/repository-interfaces/mentor/IMentorBookingRepository";
import { IMentorSlotService } from "../../interfaces/service-interfaces/mentor/IMentorSlotService";
import { CreateBookingInput } from "../../dtos/mentor/create-booking.dto";
import { IMentorBooking } from "../../infrastructure/database/models/mentor-booking.model";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import { BOOKING_MESSAGES } from "../../constants/messages";
import { BookingStatus } from "../../constants/booking-status";
import { BOOKING_CONFIG } from "../../constants/session-config";

export class MentorBookingService implements IMentorBookingService {
  constructor(
    private readonly bookingRepo: IMentorBookingRepository,
    private readonly slotService: IMentorSlotService
  ) {}

  async createBooking(studentId: string, data: CreateBookingInput): Promise<IMentorBooking> {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    // future validation
    if (!isAfter(startTime, new Date())) {
      throw new AppError(BOOKING_MESSAGES.PAST_SLOT, STATUS_CODES.BAD_REQUEST);
    }

    // backend slot verification
    const generatedSlots = await this.slotService.getMentorSlots(
      data.mentorId,
      startTime.toISOString(),
      endTime.toISOString()
    );

    const slotExists = generatedSlots.some(
      (slot) => slot.start === startTime.toISOString() && slot.end === endTime.toISOString()
    );

    if (!slotExists) {
      throw new AppError(BOOKING_MESSAGES.INVALID_SLOT, STATUS_CODES.BAD_REQUEST);
    }

    try {
      return await this.bookingRepo.createBooking(studentId, data);
    } catch (error: unknown) {
      // Mongo duplicate key = already booked
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: number }).code === 11000) {
        throw new AppError(BOOKING_MESSAGES.ALREADY_BOOKED, STATUS_CODES.CONFLICT);
      }
      throw error;
    }
  }

  async getMyBookings(studentId: string): Promise<IMentorBooking[]> {
    return this.bookingRepo.getStudentBookings(studentId);
  }

  async getMentorBookings(mentorId: string): Promise<IMentorBooking[]> {
    return this.bookingRepo.getMentorBookings(mentorId);
  }

  async cancelBooking(bookingId: string, userId: string): Promise<IMentorBooking | null> {
    const booking = await this.bookingRepo.findById(bookingId);

    if (!booking) {
      throw new AppError(BOOKING_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new AppError(BOOKING_MESSAGES.ALREADY_CANCELLED, STATUS_CODES.BAD_REQUEST);
    }

    // cancellation window: no cancellation within 2 hours
    const hoursLeft = differenceInHours(booking.startTime, new Date());

    if (hoursLeft < BOOKING_CONFIG.CANCELLATION_WINDOW_HOURS) {
      throw new AppError(BOOKING_MESSAGES.CANCELLATION_WINDOW_CLOSED, STATUS_CODES.BAD_REQUEST);
    }

    return this.bookingRepo.cancelBooking(bookingId, userId);
  }
}
