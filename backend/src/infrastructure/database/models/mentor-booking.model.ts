import { Schema, model, Types, Document } from "mongoose";
import { BookingStatus } from "../../../constants/booking-status";

export interface IMentorBooking extends Document {
  mentorId: Types.ObjectId;
  studentId: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  cancelledBy?: Types.ObjectId;
  cancelReason?: string;
  notes?: string;
  meetingProvider?: string;
  meetingRoomId?: string;
}

const MentorBookingSchema = new Schema(
  {
    mentorId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.CONFIRMED,
    },
    cancelledBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    cancelReason: {
      type: String,
    },
    notes: {
      type: String,
    },
    meetingProvider: {
      type: String,
    },
    meetingRoomId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL: Prevent double booking

MentorBookingSchema.index(
  {
    mentorId: 1,
    startTime: 1,
    endTime: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      },
    },
  }
);

MentorBookingSchema.index({ mentorId: 1 });
MentorBookingSchema.index({ studentId: 1 });
MentorBookingSchema.index({ status: 1 });

export const MentorBooking = model<IMentorBooking>("MentorBooking", MentorBookingSchema);
