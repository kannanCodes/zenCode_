import { CreateReviewInput, ReviewResponse, PaginatedReviewsResponse } from "../../../dtos/mentor/mentor-review.dto";
import { IMentorReview } from "../../../infrastructure/database/models/mentor-review.model";

export interface IMentorReviewService {
  createReview(studentId: string, data: CreateReviewInput): Promise<IMentorReview>;
  getMentorPublicReviews(mentorId: string, page: number, limit: number): Promise<PaginatedReviewsResponse>;
  hasStudentReviewedBooking(studentId: string, bookingId: string): Promise<boolean>;
}
