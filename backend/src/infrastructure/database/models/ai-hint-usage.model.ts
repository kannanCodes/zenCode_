import { Schema, model, Document, Types } from 'mongoose';

export interface IGeneratedHintEntry {
  hint: string;
  model: string;
  responseTimeMs: number;
  createdAt: Date;
}

export interface IAiHintUsageDocument extends Document {
  userId: Types.ObjectId;
  problemId: Types.ObjectId;
  hintsUsed: number;
  generatedHints: IGeneratedHintEntry[];
  lastHintAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GeneratedHintEntrySchema = new Schema<IGeneratedHintEntry>(
  {
    hint: { type: String, required: true },
    model: { type: String, required: true },
    responseTimeMs: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AiHintUsageSchema = new Schema<IAiHintUsageDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    hintsUsed: { type: Number, default: 0 },
    generatedHints: { type: [GeneratedHintEntrySchema], default: [] },
    lastHintAt: { type: Date },
  },
  { timestamps: true }
);

AiHintUsageSchema.index({ userId: 1, problemId: 1 }, { unique: true });

export const AiHintUsage = model<IAiHintUsageDocument>('AiHintUsage', AiHintUsageSchema);
