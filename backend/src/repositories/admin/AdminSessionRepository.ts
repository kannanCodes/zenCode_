import { Types } from 'mongoose';
import { MentorSession, IMentorSession, ConnectionEvent } from '../../infrastructure/database/models/mentor-session.model';
import { IAdminSessionRepository } from '../../interfaces/repository-interfaces/admin/IAdminSessionRepository';

type PopulatedMentorSession = Omit<IMentorSession, 'studentId' | 'mentorId' | 'problemId'> & {
  _id: Types.ObjectId;
  studentId?: { _id: Types.ObjectId; fullName: string; email: string };
  mentorId?: { _id: Types.ObjectId; fullName: string; email: string };
  problemId?: { _id: Types.ObjectId; title: string };
};
import {
  AdminSessionQueryDto,
  AdminSessionPaginatedResponse,
  AdminSessionListDto,
  AdminSessionDetailsDto,
  AdminSessionTimelineEventDto,
} from '../../dtos/admin/admin-session.dto';

export class AdminSessionRepository implements IAdminSessionRepository {
  async getSessions(query: AdminSessionQueryDto): Promise<AdminSessionPaginatedResponse> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (query.status && query.status !== 'ALL') {
      filter.status = query.status;
    }

    // Populate user details for search filtering if needed, though search on populated fields
    // is tricky in simple mongo queries without aggregation. We will do a basic find.
    // If search is provided, we can search by roomId.
    if (query.search) {
      filter.roomId = { $regex: query.search, $options: 'i' };
    }

    const [totalCount, sessions] = await Promise.all([
      MentorSession.countDocuments(filter),
      MentorSession.find(filter)
        .sort({ scheduledStart: -1 })
        .skip(skip)
        .limit(limit)
        .populate('studentId', 'fullName email')
        .populate('mentorId', 'fullName email')
        .populate('problemId', 'title')
        .lean(),
    ]);

    const mappedSessions: AdminSessionListDto[] = (sessions as unknown as PopulatedMentorSession[]).map((session) => ({
      id: session._id.toString(),
      roomId: session.roomId,
      candidateName: session.studentId?.fullName || 'Unknown',
      mentorName: session.mentorId?.fullName || 'Unknown',
      problemTitle: session.problemId?.title || null,
      status: session.status,
      scheduledStart: session.scheduledStart.toISOString(),
      scheduledEnd: session.scheduledEnd.toISOString(),
    }));

    return {
      sessions: mappedSessions,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async getSessionDetails(id: string): Promise<AdminSessionDetailsDto | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const session = await MentorSession.findById(id)
      .populate('studentId', 'fullName email')
      .populate('mentorId', 'fullName email')
      .populate('problemId', 'title')
      .lean();

    if (!session) return null;

    const populatedSession = session as unknown as PopulatedMentorSession;

    const candidate = {
      id: populatedSession.studentId?._id?.toString() || '',
      name: populatedSession.studentId?.fullName || 'Unknown',
      email: populatedSession.studentId?.email || '',
    };

    const mentor = {
      id: populatedSession.mentorId?._id?.toString() || '',
      name: populatedSession.mentorId?.fullName || 'Unknown',
      email: populatedSession.mentorId?.email || '',
    };

    const timeline: AdminSessionTimelineEventDto[] = [];

    timeline.push({
      id: `sched-${session._id}`,
      type: 'scheduled',
      timestamp: session.scheduledStart.toISOString(),
      actor: 'System',
      description: 'Session Scheduled',
    });

    if (populatedSession.studentJoinedAt) {
      timeline.push({
        id: `c-join-${populatedSession._id}`,
        type: 'candidate_joined',
        timestamp: populatedSession.studentJoinedAt.toISOString(),
        actor: candidate.name,
        description: 'Candidate joined',
      });
    }

    if (populatedSession.mentorJoinedAt) {
      timeline.push({
        id: `m-join-${populatedSession._id}`,
        type: 'mentor_joined',
        timestamp: populatedSession.mentorJoinedAt.toISOString(),
        actor: mentor.name,
        description: 'Mentor joined',
      });
    }

    if (populatedSession.startedAt) {
      timeline.push({
        id: `start-${populatedSession._id}`,
        type: 'started',
        timestamp: populatedSession.startedAt.toISOString(),
        actor: 'System',
        description: 'Session Started',
      });
    }

    if (populatedSession.endedAt) {
      timeline.push({
        id: `end-${populatedSession._id}`,
        type: 'ended',
        timestamp: populatedSession.endedAt.toISOString(),
        actor: 'System',
        description: 'Session Ended',
      });
    }

    // Process connection events
    if (Array.isArray(populatedSession.connectionEvents)) {
      populatedSession.connectionEvents.forEach((ev: ConnectionEvent, index: number) => {
        if (ev.type !== 'heartbeat') {
          let actor = 'System';
          if (ev.userId === candidate.id) actor = candidate.name;
          else if (ev.userId === mentor.id) actor = mentor.name;

          let type: AdminSessionTimelineEventDto['type'] = 'disconnected';
          let description = 'Participant disconnected';

          if (ev.type === 'disconnected') {
            type = 'disconnected';
            description = `${actor} disconnected`;
          } else if (ev.type === 'reconnected') {
            type = 'reconnected';
            description = `${actor} reconnected`;
          }

          timeline.push({
            id: `conn-${index}-${populatedSession._id}`,
            type,
            timestamp: ev.timestamp.toISOString(),
            actor,
            description,
          });
        }
      });
    }

    timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let actualDurationMinutes = null;
    if (populatedSession.startedAt && populatedSession.endedAt) {
      const ms = new Date(populatedSession.endedAt).getTime() - new Date(populatedSession.startedAt).getTime();
      actualDurationMinutes = Math.round(ms / 60000);
    }

    return {
      id: populatedSession._id.toString(),
      roomId: populatedSession.roomId,
      candidate,
      mentor,
      problem: populatedSession.problemId ? {
        id: populatedSession.problemId._id.toString(),
        title: populatedSession.problemId.title,
      } : null,
      status: populatedSession.status,
      timing: {
        scheduledStart: populatedSession.scheduledStart.toISOString(),
        scheduledEnd: populatedSession.scheduledEnd.toISOString(),
        startedAt: populatedSession.startedAt ? populatedSession.startedAt.toISOString() : null,
        endedAt: populatedSession.endedAt ? populatedSession.endedAt.toISOString() : null,
        actualDurationMinutes,
      },
      timeline,
    };
  }
}
