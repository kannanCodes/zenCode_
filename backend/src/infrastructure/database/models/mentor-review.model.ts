import { Schema, model, Types, Document } from 'mongoose';

export interface IMentorReview extends Document {
  bookingId: Types.ObjectId;
  mentorId: Types.ObjectId;
  studentId: Types.ObjectId;
  rating: number; // 1 to 5
  feedback: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MentorReviewSchema = new Schema(
  {
    bookingId: {
      type: Types.ObjectId,
      ref: 'MentorBooking',
      required: true,
      unique: true, // 1 review per booking
    },
    mentorId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      required: true,
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

MentorReviewSchema.index({ mentorId: 1 });
MentorReviewSchema.index({ studentId: 1 });

export const MentorReview = model<IMentorReview>('MentorReview', MentorReviewSchema);
