import { Schema, model, Document } from 'mongoose';

export interface IPlanFeature {
  name: string;
  description?: string;
  enabled: boolean;
}

export interface IPlanAccess {
  mentorBooking: boolean;
  premiumProblems: boolean;
  aiHints: boolean;
}

export interface IPlan {
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  intervalCount: number;
  durationInDays: number;
  description: string;
  features: IPlanFeature[];
  access: IPlanAccess;
  stripeProductId: string;
  stripePriceId: string;
  isActive: boolean;
  isArchived: boolean;
}

export interface IPlanDocument extends IPlan, Document {}

const PlanSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    intervalCount: {
      type: Number,
      default: 1,
    },
    durationInDays: {
      type: Number,
      required: true,
      min: 1,
    },
    description: {
      type: String,
      required: true,
    },
    features: {
      type: [
        {
          name: { type: String, required: true },
          description: { type: String },
          enabled: { type: Boolean, default: true },
        },
      ],
      default: [],
    },
    access: {
      mentorBooking: { type: Boolean, default: false },
      premiumProblems: { type: Boolean, default: false },
      aiHints: { type: Boolean, default: false },
    },
    stripeProductId: {
      type: String,
      required: true,
    },
    stripePriceId: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

PlanSchema.index({ isActive: 1 });
PlanSchema.index({ isArchived: 1 });
PlanSchema.index({ stripeProductId: 1 });
PlanSchema.index({ stripePriceId: 1 });

export default model<IPlanDocument>('Plan', PlanSchema);
