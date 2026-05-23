import { Schema, model, Types, Document } from 'mongoose';
import { MentorSessionStatus } from '../../../constants/session-status';

export interface ConnectionEvent {
  userId: string;
  type: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface IMentorSession extends Document {
  bookingId: Types.ObjectId;
  roomId: string;
  mentorId: Types.ObjectId;
  studentId: Types.ObjectId;
  status: MentorSessionStatus;
  scheduledStart: Date;
  scheduledEnd: Date;
  startedAt?: Date;
  endedAt?: Date;
  mentorJoinedAt?: Date;
  studentJoinedAt?: Date;
  lastActivityAt?: Date;
  lastHeartbeatAt?: Date;
  mentorDisconnectedAt?: Date;
  studentDisconnectedAt?: Date;
  reconnectDeadline?: Date;
  connectionEvents: ConnectionEvent[];
  mentorOnline: boolean;
  studentOnline: boolean;
  endedBy?: Types.ObjectId;
  cancellationReason?: string;
  
  // Metrics
  totalReconnects?: number;
  maxCallDurationMinutes?: number;
  actualDurationMinutes?: number;
  participantCount?: number;
}

const MentorSessionSchema = new Schema(
  {
    bookingId: {
      type: Types.ObjectId,
      ref: 'MentorBooking',
      required: true,
      unique: true,
    },
    roomId: {
      type: String,
      required: true,
      unique: true,
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
    status: {
      type: String,
      enum: Object.values(MentorSessionStatus),
      default: MentorSessionStatus.SCHEDULED,
    },
    scheduledStart: {
      type: Date,
      required: true,
    },
    scheduledEnd: {
      type: Date,
      required: true,
    },
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
    lastHeartbeatAt: {
      type: Date,
    },
    mentorJoinedAt: {
      type: Date,
    },
    studentJoinedAt: {
      type: Date,
    },
    mentorDisconnectedAt: {
      type: Date,
    },
    studentDisconnectedAt: {
      type: Date,
    },
    reconnectDeadline: {
      type: Date,
    },
    lastActivityAt: {
      type: Date,
    },
    connectionEvents: {
      type: [
        {
          userId: String,
          type: { type: String },
          timestamp: Date,
          metadata: { type: Schema.Types.Mixed },
        }
      ],
      default: [],
    },
    mentorOnline: {
      type: Boolean,
      default: false,
    },
    studentOnline: {
      type: Boolean,
      default: false,
    },
    endedBy: {
      type: Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: {
      type: String,
    },
    totalReconnects: {
      type: Number,
      default: 0,
    },
    maxCallDurationMinutes: {
      type: Number,
    },
    actualDurationMinutes: {
      type: Number,
    },
    participantCount: {
      type: Number,
      default: 2,
    },
  },
  {
    timestamps: true,
  }
);

MentorSessionSchema.index({ mentorId: 1 });
MentorSessionSchema.index({ studentId: 1 });
MentorSessionSchema.index({ status: 1 });
MentorSessionSchema.index({
  scheduledStart: 1,
  scheduledEnd: 1,
});

export const MentorSession = model<IMentorSession>('MentorSession', MentorSessionSchema);
