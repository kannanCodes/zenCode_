import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../../../shared/constants/roles';

export interface IUser extends Document {
     id: string;
     fullName: string;
     email: string;
     password?: string;
     role: UserRole;
     avatarUrl?: string;
     isBlocked: boolean;
     isPremium: boolean;
     premiumExpiresAt?: Date;
     streakCount: number;
     bestStreak: number;
     lastActiveDate?: Date;
     googleId?: string;
     isEmailVerified: boolean;
     mentorStatus?: 'INVITED' | 'ACTIVE' | 'DISABLED';
     expertise?: string[];
     experienceLevel?: 'junior' | 'mid' | 'senior';
     createdByAdminId?: mongoose.Types.ObjectId;
     invitedAt?: Date;
     activatedAt?: Date;
     disabledAt?: Date;
     lastStatusChangedAt?: Date;
     lastStatusChangedByAdminId?: mongoose.Types.ObjectId;
     blockedAt?: Date;
     blockedByAdminId?: mongoose.Types.ObjectId;
     createdAt: Date;
     updatedAt: Date;
}

const userSchema = new Schema<IUser>(
     {
          fullName: {
               type: String,
               required: true,
               trim: true,
          },
          email: {
               type: String,
               required: true,
               unique: true,
               lowercase: true,
               trim: true,
          },
          password: {
               type: String,
          },
          role: {
               type: String,
               enum: Object.values(UserRole),
               default: UserRole.CANDIDATE,
          },
          avatarUrl: String,
          isBlocked: {
               type: Boolean,
               default: false,
          },
          isPremium: {
               type: Boolean,
               default: false,
          },
          premiumExpiresAt: Date,
          streakCount: {
               type: Number,
               default: 0,
          },
          bestStreak: {
               type: Number,
               default: 0,
          },
          lastActiveDate: Date,
          googleId: String,
          isEmailVerified: {
               type: Boolean,
               default: false,
          },
          expertise: {
               type: [String],
               default: undefined,
          },
          experienceLevel: {
               type: String,
               enum: ['junior', 'mid', 'senior'],
          },
          mentorStatus: {
               type: String,
               enum: ['INVITED', 'ACTIVE', 'DISABLED'],
               required: false,
          },
          invitedAt: {
               type: Date,
          },
          activatedAt: {
               type: Date,
          },
          disabledAt: {
               type: Date,
          },
          lastStatusChangedAt: {
               type: Date,
          },
          lastStatusChangedByAdminId: {
               type: Schema.Types.ObjectId,
               ref: 'User',
          },
          createdByAdminId: {
               type: Schema.Types.ObjectId,
               ref: 'User',
          },
          blockedAt: Date,
          blockedByAdminId: {
               type: Schema.Types.ObjectId,
               ref: 'User',
          },
     },
     {
          timestamps: true,
     },
);


userSchema.index({
     role: 1,
     mentorStatus: 1,
     experienceLevel: 1,
     isBlocked: 1,
     createdAt: -1,
     isEmailVerified: 1
});

export default mongoose.model<IUser>('User', userSchema);
