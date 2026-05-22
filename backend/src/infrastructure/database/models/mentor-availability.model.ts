import { Schema, model, Types, Document } from "mongoose";
import { DEFAULT_TIMEZONE } from "../../../shared/constants/booking";

export interface IMentorAvailability extends Document {
  mentorId: Types.ObjectId;
  timezone: string;
  weeklyAvailability: {
    monday: { startTime: string; endTime: string }[];
    tuesday: { startTime: string; endTime: string }[];
    wednesday: { startTime: string; endTime: string }[];
    thursday: { startTime: string; endTime: string }[];
    friday: { startTime: string; endTime: string }[];
    saturday: { startTime: string; endTime: string }[];
    sunday: { startTime: string; endTime: string }[];
  };
}

const TimeSlotSchema = new Schema(
  {
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const MentorAvailabilitySchema = new Schema(
  {
    mentorId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    timezone: {
      type: String,
      default: DEFAULT_TIMEZONE,
    },
    weeklyAvailability: {
      monday: { type: [TimeSlotSchema], default: [] },
      tuesday: { type: [TimeSlotSchema], default: [] },
      wednesday: { type: [TimeSlotSchema], default: [] },
      thursday: { type: [TimeSlotSchema], default: [] },
      friday: { type: [TimeSlotSchema], default: [] },
      saturday: { type: [TimeSlotSchema], default: [] },
      sunday: { type: [TimeSlotSchema], default: [] },
    },
  },
  {
    timestamps: true,
  }
);

MentorAvailabilitySchema.index({ mentorId: 1 }, { unique: true });

export default model<IMentorAvailability>("MentorAvailability", MentorAvailabilitySchema);
