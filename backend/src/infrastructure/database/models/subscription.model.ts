import { Schema, model, Document, Types } from "mongoose";
import { IPlanDocument } from "./plan.model";

export interface ISubscriptionDocument extends Document {
  userId: Types.ObjectId | string;
  planId: Types.ObjectId | IPlanDocument | string;
  scheduledPlanId?: Types.ObjectId | IPlanDocument | string | null;
  scheduledChangeAt?: Date | null;
  scheduledChangeType?: 'upgrade' | 'downgrade' | null;
  stripeScheduleId?: string | null;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'unpaid' | 'trialing';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planId: {
      type: Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    scheduledPlanId: {
      type: Types.ObjectId,
      ref: "Plan",
      default: null,
    },
    scheduledChangeAt: {
      type: Date,
      default: null,
    },
    scheduledChangeType: {
      type: String,
      enum: ["upgrade", "downgrade", null],
      default: null,
    },
    stripeScheduleId: {
      type: String,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "past_due", "unpaid", "trialing"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ userId: 1, status: 1 });

export const Subscription = model<ISubscriptionDocument>("Subscription", SubscriptionSchema);
