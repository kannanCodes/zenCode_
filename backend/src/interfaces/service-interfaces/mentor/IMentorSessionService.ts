import { CreateMentorSessionInput } from "../../../dtos/mentor/create-session.dto";
import { IMentorSession } from "../../../infrastructure/database/models/mentor-session.model";

export interface IMentorSessionService {
  createSession(data: CreateMentorSessionInput, requesterId: string): Promise<IMentorSession>;
  validateSessionAccess(roomId: string, userId: string): Promise<IMentorSession>;
  markParticipantOnline(roomId: string, userId: string): Promise<IMentorSession | null>;
  markParticipantOffline(roomId: string, userId: string): Promise<IMentorSession | null>;
  endSession(roomId: string, endedBy: string): Promise<IMentorSession | null>;
  validatePeerAccess(roomId: string, senderId: string, targetUserId: string): Promise<IMentorSession>;
  updateHeartbeat(roomId: string, userId: string): Promise<void>;
  handleDisconnect(userId: string): Promise<void>;
  handleReconnect(roomId: string, userId: string): Promise<void>;
  runSessionCleanup(): Promise<void>;
}
