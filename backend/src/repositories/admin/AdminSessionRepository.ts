import { Types } from 'mongoose';
import { MentorSession } from '../../infrastructure/database/models/mentor-session.model';
import { IAdminSessionRepository } from '../../interfaces/repository-interfaces/admin/IAdminSessionRepository';
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

    const filter: Record<string, any> = {};

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

    const mappedSessions: AdminSessionListDto[] = sessions.map((session: any) => ({
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

    const session: any = await MentorSession.findById(id)
      .populate('studentId', 'fullName email')
      .populate('mentorId', 'fullName email')
      .populate('problemId', 'title')
      .lean();

    if (!session) return null;

    const candidate = {
      id: session.studentId?._id?.toString() || '',
      name: session.studentId?.fullName || 'Unknown',
      email: session.studentId?.email || '',
    };

    const mentor = {
      id: session.mentorId?._id?.toString() || '',
      name: session.mentorId?.fullName || 'Unknown',
      email: session.mentorId?.email || '',
    };

    const timeline: AdminSessionTimelineEventDto[] = [];

    timeline.push({
      id: `sched-${session._id}`,
      type: 'scheduled',
      timestamp: session.scheduledStart.toISOString(),
      actor: 'System',
      description: 'Session Scheduled',
    });

    if (session.studentJoinedAt) {
      timeline.push({
        id: `c-join-${session._id}`,
        type: 'candidate_joined',
        timestamp: session.studentJoinedAt.toISOString(),
        actor: candidate.name,
        description: 'Candidate joined',
      });
    }

    if (session.mentorJoinedAt) {
      timeline.push({
        id: `m-join-${session._id}`,
        type: 'mentor_joined',
        timestamp: session.mentorJoinedAt.toISOString(),
        actor: mentor.name,
        description: 'Mentor joined',
      });
    }

    if (session.startedAt) {
      timeline.push({
        id: `start-${session._id}`,
        type: 'started',
        timestamp: session.startedAt.toISOString(),
        actor: 'System',
        description: 'Session Started',
      });
    }

    if (session.endedAt) {
      timeline.push({
        id: `end-${session._id}`,
        type: 'ended',
        timestamp: session.endedAt.toISOString(),
        actor: 'System',
        description: 'Session Ended',
      });
    }

    // Process connection events
    if (Array.isArray(session.connectionEvents)) {
      session.connectionEvents.forEach((ev: any, index: number) => {
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
            id: `conn-${index}-${session._id}`,
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
    if (session.startedAt && session.endedAt) {
      const ms = new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime();
      actualDurationMinutes = Math.round(ms / 60000);
    }

    return {
      id: session._id.toString(),
      roomId: session.roomId,
      candidate,
      mentor,
      problem: session.problemId ? {
        id: session.problemId._id.toString(),
        title: session.problemId.title,
      } : null,
      status: session.status,
      timing: {
        scheduledStart: session.scheduledStart.toISOString(),
        scheduledEnd: session.scheduledEnd.toISOString(),
        startedAt: session.startedAt ? session.startedAt.toISOString() : null,
        endedAt: session.endedAt ? session.endedAt.toISOString() : null,
        actualDurationMinutes,
      },
      timeline,
    };
  }
}
