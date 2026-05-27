import { CreateMentorSessionInput } from "../../../dtos/mentor/create-session.dto";
import { IMentorSession } from "../../../infrastructure/database/models/mentor-session.model";
import { IProblem } from "../../../infrastructure/database/models/problem.model";
import { ExecutionResultDto } from "../../../dtos/compiler/execute-code.dto";

export interface MentorSessionWorkspace {
  session: IMentorSession;
  problem: Partial<IProblem> | null;
  editorState: {
    code: string;
    language: string;
    version: number;
  };
  lastRunResult?: ExecutionResultDto;
  lastRunError?: string;
}

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
  getWorkspace(roomId: string, userId: string): Promise<MentorSessionWorkspace>;
  listWorkspaceProblems(roomId: string, userId: string, query: { search?: string; limit?: number }): Promise<Partial<IProblem>[]>;
  selectWorkspaceProblem(roomId: string, userId: string, problemId: string): Promise<MentorSessionWorkspace>;
  updateWorkspaceCode(roomId: string, userId: string, data: { code: string; language: string; version: number }): Promise<void>;
  updateWorkspaceRunResult(roomId: string, userId: string, data: { result?: ExecutionResultDto; error?: string }): Promise<void>;
}
