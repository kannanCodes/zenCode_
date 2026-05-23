import { BaseRepository } from "../../infrastructure/database/repositories/base/base.repository";
import { MentorReview, IMentorReview } from "../../infrastructure/database/models/mentor-review.model";
import { IMentorReviewRepository, MentorStatsAggregation } from "../../interfaces/repository-interfaces/mentor/IMentorReviewRepository";
import mongoose from "mongoose";

export class MentorReviewRepository extends BaseRepository<IMentorReview> implements IMentorReviewRepository {
  constructor() {
    super(MentorReview);
  }

  async getMentorReviews(mentorId: string): Promise<IMentorReview[]> {
    return this.model.find({ mentorId, isPublic: true })
      .populate('studentId', 'fullName avatarUrl')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getReviewByBookingId(bookingId: string): Promise<IMentorReview | null> {
    return this.findOne({ bookingId });
  }

  async calculateMentorStats(mentorId: string): Promise<MentorStatsAggregation> {
    const result = await this.model.aggregate([
      { $match: { mentorId: new mongoose.Types.ObjectId(mentorId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      return {
        rating: Math.round(result[0].averageRating * 10) / 10,
        totalSessions: result[0].count, // In a real app we might count all bookings, not just reviewed ones
      };
    }

    return { rating: 0, totalSessions: 0 };
  }
}
