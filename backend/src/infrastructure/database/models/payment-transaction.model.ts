import { Schema, model, Document, Types } from 'mongoose';

export interface IPaymentTransaction extends Document {
  userId: Types.ObjectId;
  subscriptionId?: string; // Stripe Subscription ID
  planId?: Types.ObjectId;
  stripeInvoiceId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const PaymentTransactionSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscriptionId: {
      type: String,
      index: true,
    },
    planId: {
      type: Types.ObjectId,
      ref: 'Plan',
      index: true,
    },
    stripeInvoiceId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'inr',
    },
    status: {
      type: String,
      enum: ['succeeded', 'failed'],
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const PaymentTransaction = model<IPaymentTransaction>('PaymentTransaction', PaymentTransactionSchema);
