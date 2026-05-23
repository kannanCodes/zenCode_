import { BaseRepository } from "../../../infrastructure/database/repositories/base/base.repository";
import { IMentorReview } from "../../../infrastructure/database/models/mentor-review.model";

export interface MentorStatsAggregation {
  rating: number;
  totalSessions: number;
}

export interface IMentorReviewRepository extends BaseRepository<IMentorReview> {
  getMentorReviews(mentorId: string): Promise<IMentorReview[]>;
  getReviewByBookingId(bookingId: string): Promise<IMentorReview | null>;
  calculateMentorStats(mentorId: string): Promise<MentorStatsAggregation>;
}
