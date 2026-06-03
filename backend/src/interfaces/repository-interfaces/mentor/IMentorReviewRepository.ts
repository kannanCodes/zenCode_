import { BaseRepository } from "../../../infrastructure/database/repositories/base/base.repository";
import { IMentorReview } from "../../../infrastructure/database/models/mentor-review.model";



export interface IMentorReviewRepository extends BaseRepository<IMentorReview> {
  getMentorReviews(mentorId: string, page: number, limit: number): Promise<[IMentorReview[], number]>;
  getReviewByBookingId(bookingId: string): Promise<IMentorReview | null>;
  createReviewAndUpdateRating(
    studentId: string,
    bookingId: string,
    mentorId: string,
    rating: number,
    feedback: string
  ): Promise<IMentorReview>;
}
