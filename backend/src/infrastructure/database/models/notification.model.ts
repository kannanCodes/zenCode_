import { Schema, model, Types, Document } from 'mongoose';
import { NotificationType } from '../../../constants/notification-type';

export interface NotificationData {
  bookingId?: string;
  sessionId?: string;
  mentorId?: string;
  candidateId?: string;
  startTime?: string;
  endTime?: string;
}

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  isRead: boolean;
  dedupeKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    dedupeKey: {
      type: String,
      sparse: true,    // allows null/undefined; only unique when present
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────

NotificationSchema.index({ recipientId: 1, createdAt: -1 });

NotificationSchema.index({ recipientId: 1, isRead: 1 });

NotificationSchema.index({ dedupeKey: 1 }, { unique: true, sparse: true });

NotificationSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 7_776_000, // 90 days
    partialFilterExpression: { isRead: true },
  }
);

export const Notification = model<INotification>('Notification', NotificationSchema);
