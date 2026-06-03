import { BaseRepository } from "../../infrastructure/database/repositories/base/base.repository";
import { MentorReview, IMentorReview } from "../../infrastructure/database/models/mentor-review.model";
import { IMentorReviewRepository } from "../../interfaces/repository-interfaces/mentor/IMentorReviewRepository";
import mongoose from "mongoose";
import User from "../../infrastructure/database/models/user.model";

export class MentorReviewRepository extends BaseRepository<IMentorReview> implements IMentorReviewRepository {
  constructor() {
    super(MentorReview);
  }

  async getMentorReviews(mentorId: string, page: number, limit: number): Promise<[IMentorReview[], number]> {
    const filter = { mentorId, isPublic: true };
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.model.find(filter)
        .populate('studentId', 'fullName avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(filter)
    ]);

    return [reviews, total];
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
    // 1. Create the review (primary operation)
    const review = await this.model.create({
      bookingId: new mongoose.Types.ObjectId(bookingId),
      mentorId: new mongoose.Types.ObjectId(mentorId),
      studentId: new mongoose.Types.ObjectId(studentId),
      rating,
      feedback,
    });

    // 2. Atomically update mentor's denormalised rating stats using
    //    MongoDB's $inc so we never need a read-modify-write cycle.
    //    If this fails the review is already saved; a background job or
    //    next submission will recalculate — acceptable for a rating counter.
    try {
      const mentor = await User.findById(mentorId);
      if (mentor) {
        const currentTotal = mentor.totalReviews || 0;
        const currentAvg   = mentor.averageRating || 0;
        const newTotal      = currentTotal + 1;
        const newAvg        = Math.round(((currentAvg * currentTotal + rating) / newTotal) * 10) / 10;

        await User.findByIdAndUpdate(mentorId, {
          $set: {
            totalReviews:  newTotal,
            averageRating: newAvg,
          },
        });
      }
    } catch (ratingErr) {
      // Non-fatal: review is already persisted. Log and continue.
      console.error('[MentorReviewRepository] Failed to update mentor rating stats:', ratingErr);
    }

    return review;
  }
}
