import { Types } from 'mongoose';
import { Submission } from '../../infrastructure/database/models/submission.model';

export interface HeatmapDay {
  date: string;   // "YYYY-MM-DD" in UTC
  count: number;
}

export interface RecentSubmission {
  id: string;
  problemId: string;
  problemTitle: string;
  status: string;
  language: string;
  createdAt: string;
}

export class DashboardRepository {
  /**
   * Counts ALL submissions (any status) per day for the last `days` days.
   * Used for the activity heatmap.
   */
  async getHeatmapData(userId: string, days = 182): Promise<HeatmapDay[]> {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days);
    since.setUTCHours(0, 0, 0, 0);

    const raw = await Submission.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return raw.map((d) => ({ date: d._id as string, count: d.count as number }));
  }

  /**
   * Returns the last `limit` submissions for the user, with problem title
   * populated via a single $lookup aggregation (no extra round-trip).
   */
  async getRecentSubmissions(userId: string, limit = 5): Promise<RecentSubmission[]> {
    const docs = await Submission.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      { $sort: { createdAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'problems',
          localField: 'problemId',
          foreignField: '_id',
          as: 'problem',
          pipeline: [{ $project: { title: 1 } }],
        },
      },
      { $unwind: { path: '$problem', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          problemId: 1,
          problemTitle: { $ifNull: ['$problem.title', 'Unknown Problem'] },
          status: 1,
          language: 1,
          createdAt: 1,
        },
      },
    ]);

    return docs.map((d) => ({
      id: String(d._id),
      problemId: String(d.problemId),
      problemTitle: d.problemTitle as string,
      status: d.status as string,
      language: d.language as string,
      createdAt: (d.createdAt as Date).toISOString(),
    }));
  }
}
