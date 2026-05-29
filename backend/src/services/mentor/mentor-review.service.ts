import { Types } from "mongoose";
import { IMentorReviewService } from "../../interfaces/service-interfaces/mentor/IMentorReviewService";
import { IMentorReviewRepository } from "../../interfaces/repository-interfaces/mentor/IMentorReviewRepository";
import { IMentorBookingRepository } from "../../interfaces/repository-interfaces/mentor/IMentorBookingRepository";
import { CreateReviewInput, ReviewResponse } from "../../dtos/mentor/mentor-review.dto";
import { IMentorReview } from "../../infrastructure/database/models/mentor-review.model";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import { BookingStatus } from "../../constants/booking-status";
import { BOOKING_MESSAGES, REVIEW_MESSAGES } from "../../constants/messages";

export class MentorReviewService implements IMentorReviewService {
  constructor(
    private readonly reviewRepo: IMentorReviewRepository,
    private readonly bookingRepo: IMentorBookingRepository
  ) {}

  async createReview(studentId: string, data: CreateReviewInput): Promise<IMentorReview> {
    const booking = await this.bookingRepo.findById(data.bookingId);
    
    if (!booking) {
      throw new AppError(BOOKING_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    if (booking.studentId.toString() !== studentId) {
      throw new AppError(REVIEW_MESSAGES.UNAUTHORIZED_BOOKING, STATUS_CODES.FORBIDDEN);
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new AppError('You can only review completed sessions', STATUS_CODES.BAD_REQUEST);
    }

    if (booking.endTime > new Date()) {
      throw new AppError(REVIEW_MESSAGES.CANNOT_REVIEW_BEFORE_END, STATUS_CODES.BAD_REQUEST);
    }

    const existingReview = await this.reviewRepo.getReviewByBookingId(data.bookingId);
    if (existingReview) {
      throw new AppError(REVIEW_MESSAGES.ALREADY_REVIEWED, STATUS_CODES.CONFLICT);
    }

    // Call atomic repository method
    const review = await this.reviewRepo.createReviewAndUpdateRating(
      studentId,
      data.bookingId,
      booking.mentorId.toString(),
      data.rating,
      data.feedback || ''
    );

    return review;
  }

  async getMentorPublicReviews(mentorId: string): Promise<ReviewResponse[]> {
    const reviews = await this.reviewRepo.getMentorReviews(mentorId);
    
    return reviews.map(r => {
      const student = r.studentId as unknown as { fullName?: string; avatarUrl?: string };
      return {
        id: r._id as unknown as string,
        rating: r.rating,
        feedback: r.feedback,
        studentName: student?.fullName,
        studentAvatar: student?.avatarUrl,
        createdAt: r.createdAt.toISOString(),
      };
    });
  }

  async hasStudentReviewedBooking(studentId: string, bookingId: string): Promise<boolean> {
    const existing = await this.reviewRepo.getReviewByBookingId(bookingId);
    if (!existing) return false;
    // Verify the review belongs to this student (guard against IDs from other students)
    return existing.studentId.toString() === studentId;
  }
}
