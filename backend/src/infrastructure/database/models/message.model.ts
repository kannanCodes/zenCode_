import { Schema, model, Types, Document } from 'mongoose';

export interface IMessage extends Document {
  roomId: string;
  senderId: Types.ObjectId;
  content: string;
  readBy: Types.ObjectId[];
}

const MessageSchema = new Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    readBy: {
      type: [Types.ObjectId],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const MessageModel = model<IMessage>('Message', MessageSchema);
