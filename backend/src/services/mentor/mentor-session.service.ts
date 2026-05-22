import { IMentorSessionService } from "../../interfaces/service-interfaces/mentor/IMentorSessionService";
import { IMentorSessionRepository } from "../../interfaces/repository-interfaces/mentor/IMentorSessionRepository";
import { CreateMentorSessionInput } from "../../dtos/mentor/create-session.dto";
import { IMentorSession } from "../../infrastructure/database/models/mentor-session.model";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import { generateRoomId } from "../../shared/utils/generate-room-id.util";
import { SESSION_MESSAGES } from "../../constants/messages";
import { MentorSessionStatus } from "../../constants/session-status";
import { SESSION_CONFIG } from "../../constants/session-config";
import { Types } from "mongoose";

export class MentorSessionService implements IMentorSessionService {
  constructor(private readonly sessionRepo: IMentorSessionRepository) {}

  async createSession(data: CreateMentorSessionInput): Promise<IMentorSession> {
    const existingSession = await this.sessionRepo.findByBookingId(data.bookingId);

    if (existingSession) {
      return existingSession;
    }

    const roomId = generateRoomId();

    return this.sessionRepo.createSession({
      ...data,
      roomId,
      status: MentorSessionStatus.SCHEDULED,
    } as unknown as Partial<IMentorSession>);
  }

  async validateSessionAccess(roomId: string, userId: string): Promise<IMentorSession> {
    const session = await this.sessionRepo.findByRoomId(roomId);

    if (!session) {
      throw new AppError(SESSION_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    const isParticipant =
      session.mentorId.toString() === userId || session.studentId.toString() === userId;

    if (!isParticipant) {
      throw new AppError(SESSION_MESSAGES.ACCESS_DENIED, STATUS_CODES.FORBIDDEN);
    }

    if (
      session.status === MentorSessionStatus.CANCELLED ||
      session.status === MentorSessionStatus.ENDED ||
      session.status === MentorSessionStatus.EXPIRED
    ) {
      throw new AppError(SESSION_MESSAGES.UNAVAILABLE, STATUS_CODES.BAD_REQUEST);
    }

    return session;
  }

  async markParticipantOnline(roomId: string, userId: string): Promise<IMentorSession | null> {
    const session = await this.sessionRepo.findByRoomId(roomId);

    if (!session) {
      return null;
    }

    const updateData: Partial<IMentorSession> = {
      lastActivityAt: new Date(),
    };

    if (session.mentorId.toString() === userId && !session.mentorJoinedAt) {
      updateData.mentorJoinedAt = new Date();
    }

    if (session.studentId.toString() === userId && !session.studentJoinedAt) {
      updateData.studentJoinedAt = new Date();
    }

    const isMentorJoined = updateData.mentorJoinedAt || session.mentorJoinedAt;
    const isStudentJoined = updateData.studentJoinedAt || session.studentJoinedAt;

    if (session.status === MentorSessionStatus.SCHEDULED && isMentorJoined && isStudentJoined && !session.startedAt) {
      updateData.status = MentorSessionStatus.ACTIVE;
      updateData.startedAt = new Date();
    }

    return this.sessionRepo.updateByRoomId(roomId, updateData);
  }

  async markParticipantOffline(roomId: string, userId: string): Promise<IMentorSession | null> {
    const session = await this.sessionRepo.findByRoomId(roomId);

    if (!session) {
      return null;
    }

    const updateData: Partial<IMentorSession> = {};

    if (session.mentorId.toString() === userId) {
      updateData.mentorOnline = false;
    }

    if (session.studentId.toString() === userId) {
      updateData.studentOnline = false;
    }

    return this.sessionRepo.updateByRoomId(roomId, updateData);
  }

  async endSession(roomId: string, endedBy: string): Promise<IMentorSession | null> {
    return this.sessionRepo.updateByRoomId(roomId, {
      status: MentorSessionStatus.ENDED,
      endedAt: new Date(),
      endedBy: new Types.ObjectId(endedBy),
      mentorOnline: false,
      studentOnline: false,
    });
  }

  async validatePeerAccess(roomId: string, senderId: string, targetUserId: string): Promise<IMentorSession> {
    const session = await this.sessionRepo.findByRoomId(roomId);

    if (!session) {
      throw new AppError(SESSION_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    const allowedUsers = [
      session.mentorId.toString(),
      session.studentId.toString(),
    ];

    if (!allowedUsers.includes(senderId) || !allowedUsers.includes(targetUserId)) {
      throw new AppError(SESSION_MESSAGES.UNAUTHORIZED_PEER, STATUS_CODES.FORBIDDEN);
    }

    return session;
  }
  async updateHeartbeat(roomId: string, userId: string): Promise<void> {
    const session = await this.sessionRepo.findByRoomId(roomId);
    if (!session) return;

    await this.sessionRepo.updateByRoomId(roomId, {
      lastHeartbeatAt: new Date(),
    });

    await this.sessionRepo.addConnectionEvent(roomId, {
      userId,
      type: 'heartbeat',
      timestamp: new Date(),
    });
  }

  async handleDisconnect(userId: string): Promise<void> {
    const sessions = await this.sessionRepo.findActiveSessionsByUser(userId);
    const now = new Date();
    const reconnectDeadline = new Date(now.getTime() + SESSION_CONFIG.RECONNECT_WINDOW_MINUTES * 60 * 1000);

    for (const session of sessions) {
      const updateData: Partial<IMentorSession> = {
        reconnectDeadline,
      };

      if (session.mentorId.toString() === userId) {
        updateData.mentorDisconnectedAt = now;
      }

      if (session.studentId.toString() === userId) {
        updateData.studentDisconnectedAt = now;
      }

      await this.sessionRepo.updateByRoomId(session.roomId, updateData);
      await this.sessionRepo.addConnectionEvent(session.roomId, {
        userId,
        type: 'disconnected',
        timestamp: now,
      });
    }
  }

  async handleReconnect(roomId: string, userId: string): Promise<void> {
    const session = await this.sessionRepo.findByRoomId(roomId);
    if (!session) return;

    const updateData: Partial<IMentorSession> = {
      reconnectDeadline: undefined,
    };

    if (session.mentorId.toString() === userId) {
      updateData.mentorDisconnectedAt = undefined;
    }

    if (session.studentId.toString() === userId) {
      updateData.studentDisconnectedAt = undefined;
    }

    // Need to unset reconnectDeadline explicitly
    await this.sessionRepo.updateByIdRaw(session._id as unknown as string, {
      $unset: {
        reconnectDeadline: 1,
        ...(session.mentorId.toString() === userId ? { mentorDisconnectedAt: 1 } : { studentDisconnectedAt: 1 })
      }
    });

    await this.sessionRepo.addConnectionEvent(roomId, {
      userId,
      type: 'reconnected',
      timestamp: new Date(),
    });
  }

  async runSessionCleanup(): Promise<void> {
    const now = new Date();
    const sessions = await this.sessionRepo.findSessionsNeedingCleanup(now);

    for (const session of sessions) {
      // No-show detection: 15 mins passed, mentor never joined
      const isNoShow = session.status === MentorSessionStatus.SCHEDULED &&
        session.scheduledStart.getTime() <= now.getTime() - SESSION_CONFIG.NO_SHOW_THRESHOLD_MINUTES * 60 * 1000 &&
        !session.mentorJoinedAt;

      // Abandoned detection: Reconnect deadline passed
      const isAbandoned = session.reconnectDeadline && session.reconnectDeadline <= now;

      if (isNoShow) {
        await this.sessionRepo.updateByRoomId(session.roomId, {
          status: MentorSessionStatus.NO_SHOW,
          endedAt: now,
        });
      } else if (isAbandoned) {
        await this.sessionRepo.updateByRoomId(session.roomId, {
          status: MentorSessionStatus.ABANDONED,
          endedAt: now,
        });
      }
    }
  }
}
