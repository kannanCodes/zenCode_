import { BaseRepository } from "../../infrastructure/database/repositories/base/base.repository";
import { MentorReview, IMentorReview } from "../../infrastructure/database/models/mentor-review.model";
import { IMentorReviewRepository } from "../../interfaces/repository-interfaces/mentor/IMentorReviewRepository";
import mongoose from "mongoose";
import User from "../../infrastructure/database/models/user.model";

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



  async createReviewAndUpdateRating(
    studentId: string,
    bookingId: string,
    mentorId: string,
    rating: number,
    feedback: string
  ): Promise<IMentorReview> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Create the review
      const [review] = await this.model.create(
        [
          {
            bookingId: new mongoose.Types.ObjectId(bookingId),
            mentorId: new mongoose.Types.ObjectId(mentorId),
            studentId: new mongoose.Types.ObjectId(studentId),
            rating,
            feedback,
          },
        ],
        { session }
      );

      // 2. Fetch current mentor stats to calculate new average
      const mentor = await User.findById(mentorId).session(session);
      if (!mentor) {
        throw new Error('Mentor not found');
      }

      const currentTotalReviews = mentor.totalReviews || 0;
      const currentAverageRating = mentor.averageRating || 0;

      const newTotalReviews = currentTotalReviews + 1;
      const newAverageRating =
        (currentAverageRating * currentTotalReviews + rating) / newTotalReviews;

      // 3. Update the mentor's denormalized fields
      await User.findByIdAndUpdate(
        mentorId,
        {
          $set: {
            totalReviews: newTotalReviews,
            averageRating: Math.round(newAverageRating * 10) / 10, // Keep 1 decimal place
          },
        },
        { session }
      );

      await session.commitTransaction();
      return review;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
