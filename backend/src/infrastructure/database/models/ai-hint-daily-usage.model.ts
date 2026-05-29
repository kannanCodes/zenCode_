import { Schema, model, Document, Types } from 'mongoose';

export interface IAiHintDailyUsageDocument extends Document {
  userId: Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  count: number;
}

const AiHintDailyUsageSchema = new Schema<IAiHintDailyUsageDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    count: { type: Number, default: 0 },
  },
  { timestamps: false }
);

AiHintDailyUsageSchema.index({ userId: 1, date: 1 }, { unique: true });

export const AiHintDailyUsage = model<IAiHintDailyUsageDocument>('AiHintDailyUsage', AiHintDailyUsageSchema);
