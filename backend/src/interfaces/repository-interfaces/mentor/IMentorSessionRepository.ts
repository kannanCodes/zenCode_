import { BaseRepository } from "../../../infrastructure/database/repositories/base/base.repository";
import { IMentorSession, ConnectionEvent } from "../../../infrastructure/database/models/mentor-session.model";
import { UpdateQuery } from "mongoose";

export interface IMentorSessionRepository extends BaseRepository<IMentorSession> {
  createSession(data: Partial<IMentorSession>): Promise<IMentorSession>;
  findByBookingId(bookingId: string): Promise<IMentorSession | null>;
  findByRoomId(roomId: string): Promise<IMentorSession | null>;
  updateByRoomId(roomId: string, data: Partial<IMentorSession>): Promise<IMentorSession | null>;
  findActiveSessionsByUser(userId: string): Promise<IMentorSession[]>;
  findSessionsNeedingCleanup(currentTime: Date): Promise<IMentorSession[]>;
  addConnectionEvent(roomId: string, event: ConnectionEvent): Promise<void>;
  updateByIdRaw(id: string, update: UpdateQuery<IMentorSession>): Promise<void>;
}
