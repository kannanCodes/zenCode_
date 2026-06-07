import User from '../../infrastructure/database/models/user.model';
import { Subscription } from '../../infrastructure/database/models/subscription.model';
import { MentorSession } from '../../infrastructure/database/models/mentor-session.model';
import { MentorBooking } from '../../infrastructure/database/models/mentor-booking.model';
import { Problem } from '../../infrastructure/database/models/problem.model';
import { Submission, SubmissionStatus } from '../../infrastructure/database/models/submission.model';
import { UserRole } from '../../shared/constants/roles';
import { MentorSessionStatus } from '../../constants/session-status';
import { BookingStatus } from '../../constants/booking-status';
import mongoose from 'mongoose';
import { IAdminDashboardRepository } from '../../interfaces/repository-interfaces/admin/IAdminDashboardRepository';
import {
  AdminDashboardStatsDto,
  AdminDashboardActivityDto,
  AdminDashboardAnalyticsDto,
  AdminPendingActionsDto,
  DailyDataPoint,
} from '../../dtos/admin/admin-dashboard.dto';

export class AdminDashboardRepository implements IAdminDashboardRepository {

  async getStats(): Promise<AdminDashboardStatsDto> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // ── Parallel queries — never load full collections ──────────────────────
    const [
      totalUsers,
      totalMentors,
      totalCandidates,
      totalSessions,
      completedSessions,
      cancelledSessions,
      activeSessions,
      totalProblems,
      premiumProblems,
      submissionsToday,
      totalSubmissions,
      acceptedSubmissions,
      subscriptionAgg,
      revenueAgg,
    ] = await Promise.all([
      // Users
      User.countDocuments({}),
      User.countDocuments({ role: UserRole.MENTOR }),
      User.countDocuments({ role: UserRole.CANDIDATE }),

      // Sessions
      MentorSession.countDocuments({}),
      MentorSession.countDocuments({ status: MentorSessionStatus.ENDED }),
      MentorSession.countDocuments({
        status: { $in: [MentorSessionStatus.CANCELLED, MentorSessionStatus.NO_SHOW, MentorSessionStatus.ABANDONED] },
      }),
      MentorSession.countDocuments({ status: MentorSessionStatus.ACTIVE }),

      // Problems
      Problem.countDocuments({ isActive: true }),
      Problem.countDocuments({ isPremium: true, isActive: true }),

      // Submissions today
      Submission.countDocuments({ createdAt: { $gte: todayStart, $lt: todayEnd } }),
      Submission.countDocuments({}),
      Submission.countDocuments({ status: SubmissionStatus.ACCEPTED }),

      // Subscription stats via join with Plan
      Subscription.aggregate([
        {
          $lookup: {
            from: 'plans',
            localField: 'planId',
            foreignField: '_id',
            as: 'plan',
          },
        },
        { $unwind: '$plan' },
        {
          $group: {
            _id: null,
            activeCount: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
            },
            monthlyCount: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$status', 'active'] }, { $eq: ['$plan.billingCycle', 'monthly'] }] },
                  1,
                  0,
                ],
              },
            },
            yearlyCount: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$status', 'active'] }, { $eq: ['$plan.billingCycle', 'yearly'] }] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),

      // Revenue from PaymentTransaction
      mongoose.model('PaymentTransaction').aggregate([
        { $match: { status: 'succeeded' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            monthlyRevenue: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', new Date(now.getFullYear(), now.getMonth(), 1)] },
                  '$amount',
                  0
                ]
              }
            }
          }
        }
      ]),
    ]);

    const subStats = subscriptionAgg[0] ?? {
      activeCount: 0,
      monthlyCount: 0,
      yearlyCount: 0,
    };

    const revStats = revenueAgg[0] ?? {
      totalRevenue: 0,
      monthlyRevenue: 0,
    };

    const acceptanceRate =
      totalSubmissions > 0
        ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
        : 0;

    const avgRevenuePerUser =
      subStats.activeCount > 0
        ? Math.round((revStats.totalRevenue / subStats.activeCount) * 100) / 100
        : 0;

    return {
      totalUsers,
      totalMentors,
      totalCandidates,
      activeSubscriptions: subStats.activeCount,
      monthlySubscriptions: subStats.monthlyCount,
      yearlySubscriptions: subStats.yearlyCount,
      totalRevenue: revStats.totalRevenue,
      monthlyRevenue: revStats.monthlyRevenue,
      yearlyRevenue: revStats.totalRevenue - revStats.monthlyRevenue,
      avgRevenuePerUser: totalCandidates > 0 ? Math.round(revStats.totalRevenue / totalCandidates) : 0,
      totalSessions,
      completedSessions,
      cancelledSessions,
      activeSessions,
      totalProblems,
      premiumProblems,
      submissionsToday,
      acceptanceRate,
    };
  }

  async getActivityFeed(limit = 20): Promise<AdminDashboardActivityDto[]> {
    type LeanWithTimestamps = { createdAt?: Date; updatedAt?: Date };

    // Pull latest bookings and subscriptions, merge, sort, slice
    const [recentBookings, recentSubs, recentUsers] = await Promise.all([
      MentorBooking.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('mentorId', 'fullName')
        .populate('studentId', 'fullName')
        .select('status mentorId studentId createdAt')
        .lean<Array<Record<string, unknown> & LeanWithTimestamps>>(),

      Subscription.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('userId', 'fullName')
        .select('status userId createdAt')
        .lean<Array<Record<string, unknown> & LeanWithTimestamps>>(),

      User.find({ role: { $in: [UserRole.MENTOR, UserRole.CANDIDATE] } })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('fullName role createdAt')
        .lean<Array<Record<string, unknown> & LeanWithTimestamps>>(),
    ]);

    const items: AdminDashboardActivityDto[] = [];

    for (const booking of recentBookings) {
      const mentor = booking['mentorId'] as { fullName?: string } | null;
      const student = booking['studentId'] as { fullName?: string } | null;
      const mentorName = mentor?.fullName ?? 'Unknown mentor';
      const studentName = student?.fullName ?? 'Unknown student';
      const bookingStatus = booking['status'] as string;

      let type: AdminDashboardActivityDto['type'];
      let description: string;

      if (bookingStatus === BookingStatus.CONFIRMED) {
        type = 'booking_confirmed';
        description = `${studentName} booked a session with ${mentorName}`;
      } else if (bookingStatus === BookingStatus.CANCELLED) {
        type = 'booking_cancelled';
        description = `Session between ${studentName} and ${mentorName} was cancelled`;
      } else {
        type = 'booking_confirmed';
        description = `${studentName} has a session with ${mentorName}`;
      }

      items.push({
        id: (booking['_id'] as object).toString(),
        type,
        description,
        actorName: studentName,
        timestamp: (booking.createdAt ?? new Date()).toISOString(),
      });
    }

    for (const sub of recentSubs) {
      const user = sub['userId'] as { fullName?: string } | null;
      const userName = user?.fullName ?? 'Unknown user';
      const subStatus = sub['status'] as string;

      items.push({
        id: (sub['_id'] as object).toString(),
        type: subStatus === 'cancelled' ? 'subscription_cancelled' : 'subscription_activated',
        description:
          subStatus === 'cancelled'
            ? `${userName} cancelled their subscription`
            : `${userName} activated a subscription`,
        actorName: userName,
        timestamp: (sub.createdAt ?? new Date()).toISOString(),
      });
    }

    for (const user of recentUsers) {
      const userRole = user['role'] as string;
      const fullName = (user['fullName'] as string) ?? 'Unknown';
      items.push({
        id: (user['_id'] as object).toString(),
        type: userRole === UserRole.MENTOR ? 'mentor_registered' : 'user_registered',
        description:
          userRole === UserRole.MENTOR
            ? `${fullName} was registered as a mentor`
            : `${fullName} joined zenCode`,
        actorName: fullName,
        timestamp: (user.createdAt ?? new Date()).toISOString(),
      });
    }

    // Sort all events newest-first and take the latest N
    items.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return items.slice(0, limit);
  }

  async getAnalytics(): Promise<AdminDashboardAnalyticsDto> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [userGrowthRaw, sessionsByDayRaw, revenueRaw] = await Promise.all([
      // Daily user registrations — last 30 days
      User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Daily sessions started — last 30 days
      MentorSession.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Daily revenue (subscriptions created × plan price) — last 30 days
      Subscription.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $lookup: {
            from: 'plans',
            localField: 'planId',
            foreignField: '_id',
            as: 'plan',
          },
        },
        { $unwind: '$plan' },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            revenue: { $sum: '$plan.price' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const toDataPoints = (
      raw: Array<{ _id: string; count?: number; revenue?: number }>,
      valueKey: 'count' | 'revenue',
    ): DailyDataPoint[] =>
      raw.map((r) => ({ date: r._id, value: r[valueKey] ?? 0 }));

    return {
      userGrowth: toDataPoints(userGrowthRaw as Array<{ _id: string; count: number }>, 'count'),
      revenueByDay: toDataPoints(revenueRaw as Array<{ _id: string; revenue: number }>, 'revenue'),
      sessionsByDay: toDataPoints(sessionsByDayRaw as Array<{ _id: string; count: number }>, 'count'),
    };
  }

  async getPendingActions(): Promise<AdminPendingActionsDto> {
    const [
      blockedUsersCount,
      disabledMentorsCount,
      failedSubscriptionsCount,
      pendingInvitedMentorsCount,
    ] = await Promise.all([
      User.countDocuments({ isBlocked: true }),
      User.countDocuments({ role: UserRole.MENTOR, mentorStatus: 'DISABLED' }),
      Subscription.countDocuments({ status: { $in: ['past_due', 'unpaid'] } }),
      User.countDocuments({ role: UserRole.MENTOR, mentorStatus: 'INVITED' }),
    ]);

    return {
      blockedUsersCount,
      disabledMentorsCount,
      failedSubscriptionsCount,
      pendingInvitedMentorsCount,
    };
  }
}
