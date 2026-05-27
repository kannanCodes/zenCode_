import { IMentorSessionService, MentorSessionWorkspace } from "../../interfaces/service-interfaces/mentor/IMentorSessionService";
import { IMentorSessionRepository } from "../../interfaces/repository-interfaces/mentor/IMentorSessionRepository";
import { IMentorBookingRepository } from "../../interfaces/repository-interfaces/mentor/IMentorBookingRepository";
import { IProblemRepository } from "../../interfaces/repository-interfaces/problem/IProblemRepository";
import { ISubscriptionService } from "../../interfaces/service-interfaces/payments/subscription.service.interface";
import { CreateMentorSessionInput } from "../../dtos/mentor/create-session.dto";
import { IMentorSession } from "../../infrastructure/database/models/mentor-session.model";
import { IProblem, ITestCase } from "../../infrastructure/database/models/problem.model";
import { ExecutionResultDto } from "../../dtos/compiler/execute-code.dto";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import { generateRoomId } from "../../shared/utils/generate-room-id.util";
import { BOOKING_MESSAGES, PROBLEM_MESSAGES, SESSION_MESSAGES, SUBSCRIPTION_MESSAGES } from "../../constants/messages";
import { MentorSessionStatus } from "../../constants/session-status";
import { SESSION_CONFIG } from "../../constants/session-config";
import { Types } from "mongoose";
import { BookingStatus } from "../../constants/booking-status";
import { IPlanDocument } from "../../infrastructure/database/models/plan.model";

export class MentorSessionService implements IMentorSessionService {
  constructor(
    private readonly sessionRepo: IMentorSessionRepository,
    private readonly bookingRepo: IMentorBookingRepository,
    private readonly problemRepo: IProblemRepository,
    private readonly subscriptionService: ISubscriptionService
  ) {}

  private getDefaultEditorState(session: IMentorSession, problem?: IProblem | null) {
    const language = session.workspaceLanguage || "javascript";
    const starterCode = problem?.starterCode?.[language as keyof typeof problem.starterCode];

    return {
      code: session.workspaceCode || starterCode || "// Start coding...\n",
      language,
      version: session.workspaceVersion || 0,
    };
  }

  private sanitizeProblem(problem: IProblem): Partial<IProblem> {
    const problemObj = problem.toObject();
    const publicTestCases = (problemObj.testCases as ITestCase[])?.filter((tc) => !tc.isHidden) || [];

    return {
      ...problemObj,
      testCases: publicTestCases,
    };
  }

  private async assertStudentCanAccessProblem(session: IMentorSession, problem: IProblem): Promise<void> {
    if (!problem.isActive) {
      throw new AppError(PROBLEM_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    if (!problem.isPremium) {
      return;
    }

    const subscription = await this.subscriptionService.getActiveSubscription(session.studentId.toString());
    const plan =
      subscription && typeof subscription.planId === "object"
        ? (subscription.planId as IPlanDocument)
        : null;

    if (!subscription) {
      throw new AppError(SUBSCRIPTION_MESSAGES.REQUIRED, STATUS_CODES.FORBIDDEN);
    }

    if (new Date(subscription.endDate) < new Date()) {
      throw new AppError(SUBSCRIPTION_MESSAGES.EXPIRED, STATUS_CODES.FORBIDDEN);
    }

    if (!plan?.access?.premiumProblems) {
      throw new AppError(SUBSCRIPTION_MESSAGES.FEATURE_DENIED, STATUS_CODES.FORBIDDEN);
    }
  }

  private async buildWorkspace(session: IMentorSession): Promise<MentorSessionWorkspace> {
    const problem = session.problemId
      ? await this.problemRepo.findById(session.problemId.toString())
      : null;

    return {
      session,
      problem: problem ? this.sanitizeProblem(problem) : null,
      editorState: this.getDefaultEditorState(session, problem),
      lastRunResult: session.lastRunResult,
      lastRunError: session.lastRunError,
    };
  }

  async createSession(data: CreateMentorSessionInput, requesterId: string): Promise<IMentorSession> {
    const existingSession = await this.sessionRepo.findByBookingId(data.bookingId);

    if (existingSession) {
      await this.assertSessionJoinable(existingSession);

      const isParticipant =
        existingSession.mentorId.toString() === requesterId ||
        existingSession.studentId.toString() === requesterId;

      if (!isParticipant) {
        throw new AppError(SESSION_MESSAGES.ACCESS_DENIED, STATUS_CODES.FORBIDDEN);
      }

      return existingSession;
    }

    const booking = await this.bookingRepo.findById(data.bookingId);

    if (!booking) {
      throw new AppError(BOOKING_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    const isParticipant =
      booking.mentorId.toString() === requesterId ||
      booking.studentId.toString() === requesterId;

    if (!isParticipant) {
      throw new AppError(SESSION_MESSAGES.ACCESS_DENIED, STATUS_CODES.FORBIDDEN);
    }

    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.PENDING) {
      throw new AppError(SESSION_MESSAGES.UNAVAILABLE, STATUS_CODES.BAD_REQUEST);
    }

    if (this.isSessionWindowExpired(booking.endTime)) {
      throw new AppError(SESSION_MESSAGES.UNAVAILABLE, STATUS_CODES.BAD_REQUEST);
    }

    const roomId = generateRoomId();

    return this.sessionRepo.createSession({
      bookingId: booking._id as Types.ObjectId,
      mentorId: booking.mentorId,
      studentId: booking.studentId,
      scheduledStart: booking.startTime,
      scheduledEnd: booking.endTime,
      roomId,
      status: MentorSessionStatus.SCHEDULED,
    } as Partial<IMentorSession>);
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

    await this.assertSessionJoinable(session);

    return session;
  }

  private isSessionWindowExpired(scheduledEnd: Date): boolean {
    const expiresAt = new Date(
      scheduledEnd.getTime() + SESSION_CONFIG.SESSION_END_GRACE_MINUTES * 60 * 1000
    );
    return expiresAt.getTime() <= Date.now();
  }

  private async assertSessionJoinable(session: IMentorSession): Promise<void> {
    if (
      session.status === MentorSessionStatus.CANCELLED ||
      session.status === MentorSessionStatus.ENDED ||
      session.status === MentorSessionStatus.EXPIRED ||
      session.status === MentorSessionStatus.NO_SHOW ||
      session.status === MentorSessionStatus.ABANDONED ||
      this.isSessionWindowExpired(session.scheduledEnd)
    ) {
      if (
        this.isSessionWindowExpired(session.scheduledEnd) &&
        session.status !== MentorSessionStatus.EXPIRED &&
        session.status !== MentorSessionStatus.ENDED
      ) {
        await this.sessionRepo.updateByRoomId(session.roomId, {
          status: MentorSessionStatus.EXPIRED,
          endedAt: new Date(),
          mentorOnline: false,
          studentOnline: false,
        });
      }

      throw new AppError(SESSION_MESSAGES.UNAVAILABLE, STATUS_CODES.BAD_REQUEST);
    }
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

    if (session.mentorId.toString() === userId) {
      updateData.mentorOnline = true;
    }

    if (session.studentId.toString() === userId && !session.studentJoinedAt) {
      updateData.studentJoinedAt = new Date();
    }

    if (session.studentId.toString() === userId) {
      updateData.studentOnline = true;
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
      const isBothParticipantsOffline = !session.mentorOnline && !session.studentOnline;
      const isPastScheduledEnd =
        session.scheduledEnd.getTime() <= now.getTime() - SESSION_CONFIG.SESSION_END_GRACE_MINUTES * 60 * 1000;

      // A single participant disconnect should never make the room inaccessible.
      // Abandon only when nobody is online and the reconnect window has passed.
      const isAbandoned =
        isBothParticipantsOffline &&
        session.reconnectDeadline &&
        session.reconnectDeadline <= now;

      if (isNoShow) {
        await this.sessionRepo.updateByRoomId(session.roomId, {
          status: MentorSessionStatus.NO_SHOW,
          endedAt: now,
        });
      } else if (isPastScheduledEnd) {
        await this.sessionRepo.updateByRoomId(session.roomId, {
          status: MentorSessionStatus.EXPIRED,
          endedAt: now,
          mentorOnline: false,
          studentOnline: false,
        });
      } else if (isAbandoned) {
        await this.sessionRepo.updateByRoomId(session.roomId, {
          status: MentorSessionStatus.ABANDONED,
          endedAt: now,
        });
      }
    }
  }

  async getWorkspace(roomId: string, userId: string): Promise<MentorSessionWorkspace> {
    const session = await this.validateSessionAccess(roomId, userId);
    return this.buildWorkspace(session);
  }

  async listWorkspaceProblems(
    roomId: string,
    userId: string,
    query: { search?: string; limit?: number }
  ): Promise<Partial<IProblem>[]> {
    await this.validateSessionAccess(roomId, userId);

    const filters: Record<string, unknown> = { isActive: true };
    if (query.search?.trim()) {
      filters.$or = [
        { title: { $regex: query.search.trim(), $options: "i" } },
        { tags: { $regex: query.search.trim(), $options: "i" } },
        { companyTags: { $regex: query.search.trim(), $options: "i" } },
      ];
    }

    const { problems } = await this.problemRepo.listProblems(
      filters,
      0,
      Math.min(20, Math.max(1, Number(query.limit) || 8)),
      { createdAt: -1 }
    );

    return problems;
  }

  async selectWorkspaceProblem(roomId: string, userId: string, problemId: string): Promise<MentorSessionWorkspace> {
    const session = await this.validateSessionAccess(roomId, userId);

    if (!Types.ObjectId.isValid(problemId)) {
      throw new AppError(PROBLEM_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    const problem = await this.problemRepo.findById(problemId);
    if (!problem) {
      throw new AppError(PROBLEM_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    await this.assertStudentCanAccessProblem(session, problem);

    const language =
      session.workspaceLanguage && problem.supportedLanguages?.includes(session.workspaceLanguage)
        ? session.workspaceLanguage
        : (problem.supportedLanguages?.includes("javascript") ? "javascript" : problem.supportedLanguages?.[0] || "javascript");
    const code = problem.starterCode?.[language as keyof typeof problem.starterCode] || session.workspaceCode || "// Start coding...\n";

    const updated = await this.sessionRepo.updateByRoomId(roomId, {
      problemId: problem._id as Types.ObjectId,
      workspaceCode: code,
      workspaceLanguage: language,
      workspaceVersion: (session.workspaceVersion || 0) + 1,
      lastRunResult: undefined,
      lastRunError: undefined,
      lastActivityAt: new Date(),
    });

    return this.buildWorkspace(updated || session);
  }

  async updateWorkspaceCode(
    roomId: string,
    userId: string,
    data: { code: string; language: string; version: number }
  ): Promise<void> {
    await this.validateSessionAccess(roomId, userId);

    await this.sessionRepo.updateByRoomId(roomId, {
      workspaceCode: data.code,
      workspaceLanguage: data.language,
      workspaceVersion: data.version,
      lastActivityAt: new Date(),
    });
  }

  async updateWorkspaceRunResult(
    roomId: string,
    userId: string,
    data: { result?: ExecutionResultDto; error?: string }
  ): Promise<void> {
    await this.validateSessionAccess(roomId, userId);

    await this.sessionRepo.updateByRoomId(roomId, {
      lastRunResult: data.result,
      lastRunError: data.error,
      lastActivityAt: new Date(),
    });
  }
}
