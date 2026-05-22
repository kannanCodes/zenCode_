import { BaseRepository } from "../../infrastructure/database/repositories/base/base.repository";
import { IMentorSession, MentorSession, ConnectionEvent } from "../../infrastructure/database/models/mentor-session.model";
import { IMentorSessionRepository } from "../../interfaces/repository-interfaces/mentor/IMentorSessionRepository";
import { MentorSessionStatus } from "../../constants/session-status";
import { SESSION_CONFIG } from "../../constants/session-config";
import { UpdateQuery } from "mongoose";

export class MentorSessionRepository extends BaseRepository<IMentorSession> implements IMentorSessionRepository {
  constructor() {
    super(MentorSession);
  }

  async createSession(data: Partial<IMentorSession>): Promise<IMentorSession> {
    return this.create(data);
  }

  async findByBookingId(bookingId: string): Promise<IMentorSession | null> {
    return this.model.findOne({ bookingId }).exec();
  }

  async findByRoomId(roomId: string): Promise<IMentorSession | null> {
    return this.model.findOne({ roomId }).exec();
  }

  async updateByRoomId(roomId: string, data: Partial<IMentorSession>): Promise<IMentorSession | null> {
    return this.model.findOneAndUpdate(
      { roomId },
      data,
      { new: true }
    ).exec();
  }

  async findActiveSessionsByUser(userId: string): Promise<IMentorSession[]> {
    return this.model.find({
      $or: [{ mentorId: userId }, { studentId: userId }],
      status: { $in: [MentorSessionStatus.SCHEDULED, MentorSessionStatus.ACTIVE] }
    }).exec();
  }

  async findSessionsNeedingCleanup(currentTime: Date): Promise<IMentorSession[]> {
    return this.model.find({
      status: { $in: [MentorSessionStatus.SCHEDULED, MentorSessionStatus.ACTIVE] },
      $or: [
        { reconnectDeadline: { $lte: currentTime } },
        { 
          status: MentorSessionStatus.SCHEDULED, 
          scheduledStart: { $lte: new Date(currentTime.getTime() - SESSION_CONFIG.NO_SHOW_THRESHOLD_MINUTES * 60 * 1000) },
          mentorJoinedAt: { $exists: false }
        }
      ]
    }).exec();
  }

  async addConnectionEvent(roomId: string, event: ConnectionEvent): Promise<void> {
    await this.model.updateOne({ roomId }, { $push: { connectionEvents: event } }).exec();
  }

  async updateByIdRaw(id: string, update: UpdateQuery<IMentorSession>): Promise<void> {
    await this.model.findByIdAndUpdate(id, update).exec();
  }
}
