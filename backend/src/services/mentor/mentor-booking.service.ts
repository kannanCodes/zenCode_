import { isAfter, differenceInHours } from 'date-fns';
import { IMentorBookingService, MentorDashboardStats } from '../../interfaces/service-interfaces/mentor/IMentorBookingService';
import { Types } from 'mongoose';
import { IMentorBookingRepository } from '../../interfaces/repository-interfaces/mentor/IMentorBookingRepository';
import { IMentorSlotService } from '../../interfaces/service-interfaces/mentor/IMentorSlotService';
import { INotificationService } from '../../interfaces/service-interfaces/notification/INotificationService';
import { IAuthRepository } from '../../interfaces/repository-interfaces/auth/IUserRepository';
import { CreateBookingInput } from '../../dtos/mentor/create-booking.dto';
import { IMentorBooking } from '../../infrastructure/database/models/mentor-booking.model';
import { AppError } from '../../shared/utils/AppError';
import { STATUS_CODES } from '../../shared/constants/status';
import { BOOKING_MESSAGES } from '../../constants/messages';
import { BookingStatus } from '../../constants/booking-status';
import { BOOKING_CONFIG } from '../../constants/session-config';
import { NotificationType } from '../../constants/notification-type';
import { logger } from '../../shared/utils/Logger';

export class MentorBookingService implements IMentorBookingService {
  constructor(
    private readonly bookingRepo: IMentorBookingRepository,
    private readonly slotService: IMentorSlotService,
    private readonly notificationService: INotificationService,
    private readonly userRepo: IAuthRepository
  ) {}

  async createBooking(studentId: string, data: CreateBookingInput): Promise<IMentorBooking> {
    const startTime = new Date(data.startTime);
    const endTime   = new Date(data.endTime);

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

    let booking: IMentorBooking;
    try {
      booking = await this.bookingRepo.createBooking(studentId, data);
    } catch (error: unknown) {
      // Mongo duplicate key = already booked
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: number }).code === 11000
      ) {
        throw new AppError(BOOKING_MESSAGES.ALREADY_BOOKED, STATUS_CODES.CONFLICT);
      }
      throw error;
    }

    // ── Fire notifications (non-blocking, non-fatal) ──────────────────────────
    void this.dispatchBookingConfirmedNotifications(booking, studentId, data.mentorId, startTime, endTime);

    return booking;
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

    const cancelled = await this.bookingRepo.cancelBooking(bookingId, userId);

    // ── Fire cancellation notifications (non-blocking, non-fatal) ────────────
    if (cancelled) {
      void this.dispatchCancellationNotifications(cancelled, userId);
    }

    return cancelled;
  }

  // ── Private notification helpers ────────────────────────────────────────────

  /**
   * Fetches user details and fires two idempotent notifications (candidate + mentor)
   * after a successful booking creation. Wrapped in try/catch — failure is logged only.
   */
  private async dispatchBookingConfirmedNotifications(
    booking: IMentorBooking,
    studentId: string,
    mentorId: string,
    startTime: Date,
    endTime: Date
  ): Promise<void> {
    try {
      const [student, mentor] = await Promise.all([
        this.userRepo.findById(studentId),
        this.userRepo.findById(mentorId),
      ]);

      if (!student || !mentor) {
        logger.warn('[BookingNotification] Could not fetch user(s) for notification enrichment');
        return;
      }

      const bookingId    = (booking._id as { toString(): string }).toString();
      const formattedTime = startTime.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
      }) + ' IST';

      // Candidate: "Your session is confirmed"
      void this.notificationService.create({
        recipientId: studentId,
        type:        NotificationType.MENTOR_SESSION_BOOKED,
        title:       'Session Booked! ✅',
        message:     `Your session with ${mentor.fullName} is confirmed for ${formattedTime}.`,
        data:        { bookingId, mentorId, startTime: startTime.toISOString(), endTime: endTime.toISOString() },
        dedupeKey:   `booking-confirmed-${bookingId}-${studentId}`,
        recipientEmail:   student.email,
        recipientName:    student.fullName,
        mentorName:       mentor.fullName,
        candidateName:    student.fullName,
        sessionStartTime: startTime,
        sessionEndTime:   endTime,
      });

      // Mentor: "A candidate has booked a session with you"
      void this.notificationService.create({
        recipientId: mentorId,
        type:        NotificationType.MENTOR_SESSION_BOOKED,
        title:       'New Session Booked 📅',
        message:     `${student.fullName} has booked a session with you for ${formattedTime}.`,
        data:        { bookingId, candidateId: studentId, startTime: startTime.toISOString(), endTime: endTime.toISOString() },
        dedupeKey:   `booking-new-${bookingId}-${mentorId}`,
        recipientEmail:   mentor.email,
        recipientName:    mentor.fullName,
        mentorName:       mentor.fullName,
        candidateName:    student.fullName,
        sessionStartTime: startTime,
        sessionEndTime:   endTime,
      });
    } catch (err) {
      logger.error('[BookingNotification] Failed to dispatch booking notifications (non-fatal):', err);
    }
  }

  /**
   * Fetches user details and fires cancellation notifications for both parties.
   * Wrapped in try/catch — failure is logged only.
   */
  private async dispatchCancellationNotifications(
    booking: IMentorBooking,
    cancelledByUserId: string
  ): Promise<void> {
    try {
      const studentId = booking.studentId.toString();
      const mentorId  = booking.mentorId.toString();
      const bookingId = (booking._id as { toString(): string }).toString();

      const [student, mentor, cancelledBy] = await Promise.all([
        this.userRepo.findById(studentId),
        this.userRepo.findById(mentorId),
        this.userRepo.findById(cancelledByUserId),
      ]);

      if (!student || !mentor || !cancelledBy) {
        logger.warn('[CancellationNotification] Could not fetch user(s) for notification enrichment');
        return;
      }

      const formattedTime = booking.startTime.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
      }) + ' IST';
      const cancelledByName  = cancelledBy.fullName;

      const sharedData = {
        bookingId,
        mentorId,
        candidateId: studentId,
        startTime:   booking.startTime.toISOString(),
        endTime:     booking.endTime.toISOString(),
      };

      // Candidate: cancelled
      void this.notificationService.create({
        recipientId: studentId,
        type:        NotificationType.MENTOR_SESSION_CANCELLED,
        title:       'Session Cancelled ❌',
        message:     `Your session with ${mentor.fullName} on ${formattedTime} has been cancelled by ${cancelledByName}.`,
        data:        sharedData,
        dedupeKey:   `booking-cancelled-${bookingId}-${studentId}`,
        recipientEmail:   student.email,
        recipientName:    student.fullName,
        mentorName:       mentor.fullName,
        candidateName:    student.fullName,
        sessionStartTime: booking.startTime,
        sessionEndTime:   booking.endTime,
      });

      // Mentor: cancelled
      void this.notificationService.create({
        recipientId: mentorId,
        type:        NotificationType.MENTOR_SESSION_CANCELLED,
        title:       'Session Cancelled ❌',
        message:     `The session with ${student.fullName} on ${formattedTime} has been cancelled by ${cancelledByName}.`,
        data:        sharedData,
        dedupeKey:   `booking-cancelled-${bookingId}-${mentorId}`,
        recipientEmail:   mentor.email,
        recipientName:    mentor.fullName,
        mentorName:       mentor.fullName,
        candidateName:    student.fullName,
        sessionStartTime: booking.startTime,
        sessionEndTime:   booking.endTime,
      });
    } catch (err) {
      logger.error('[CancellationNotification] Failed to dispatch cancellation notifications (non-fatal):', err);
    }
  }

  async getDashboardStats(mentorId: string): Promise<MentorDashboardStats> {
    return this.bookingRepo.getDashboardStats(mentorId);
  }

  async getUpcomingBookings(mentorId: string, limit = 10): Promise<IMentorBooking[]> {
    return this.bookingRepo.getUpcomingBookings(mentorId, limit);
  }
}
