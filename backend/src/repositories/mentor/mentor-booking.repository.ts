import { BaseRepository } from "../../infrastructure/database/repositories/base/base.repository";
import { IMentorBooking, MentorBooking } from "../../infrastructure/database/models/mentor-booking.model";
import { IMentorBookingRepository } from "../../interfaces/repository-interfaces/mentor/IMentorBookingRepository";
import { CreateBookingInput } from "../../dtos/mentor/create-booking.dto";
import { BookingStatus } from "../../constants/booking-status";
import { Types } from "mongoose";

export class MentorBookingRepository extends BaseRepository<IMentorBooking> implements IMentorBookingRepository {
  constructor() {
    super(MentorBooking);
  }

  async createBooking(studentId: string, data: CreateBookingInput): Promise<IMentorBooking> {
    return this.create({
      mentorId: new Types.ObjectId(data.mentorId),
      studentId: new Types.ObjectId(studentId),
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      status: BookingStatus.CONFIRMED,
    });
  }

  async getStudentBookings(studentId: string): Promise<IMentorBooking[]> {
    return this.model
      .find({ studentId })
      .populate("mentorId", "fullName email avatarUrl")
      .sort({ startTime: -1 })
      .exec();
  }

  async getMentorBookings(mentorId: string): Promise<IMentorBooking[]> {
    return this.model
      .find({ mentorId })
      .populate("studentId", "fullName email avatarUrl")
      .sort({ startTime: -1 })
      .exec();
  }

  async cancelBooking(bookingId: string, userId: string, reason?: string): Promise<IMentorBooking | null> {
    return this.model.findByIdAndUpdate(
      bookingId,
      {
        status: BookingStatus.CANCELLED,
        cancelledBy: new Types.ObjectId(userId),
        cancelReason: reason,
      },
      { new: true }
    ).exec();
  }

  async getDashboardStats(mentorId: string) {
    const mentorObjId = new Types.ObjectId(mentorId);
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [statsResult, activeStudentsResult] = await Promise.all([
      this.model.aggregate([
        { $match: { mentorId: mentorObjId } },
        {
          $group: {
            _id: null,
            totalSessions: {
              $sum: {
                $cond: [{ $ne: ['$status', 'cancelled'] }, 1, 0],
              },
            },
            upcomingCount: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$status', 'confirmed'] }, { $gt: ['$startTime', now] }] },
                  1, 0,
                ],
              },
            },
            todayCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$status', 'confirmed'] },
                      { $gte: ['$startTime', todayStart] },
                      { $lte: ['$startTime', todayEnd] },
                    ],
                  },
                  1, 0,
                ],
              },
            },
            completedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            finishedCount: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['completed', 'cancelled', 'no_show', 'expired']] },
                  1, 0,
                ],
              },
            },
          },
        },
      ]),
      this.model.distinct('studentId', {
        mentorId: mentorObjId,
        createdAt: { $gte: thirtyDaysAgo },
      }),
    ]);

    const stats = statsResult[0] ?? {
      totalSessions: 0,
      upcomingCount: 0,
      todayCount: 0,
      completedCount: 0,
      finishedCount: 0,
    };

    const completionRate =
      stats.finishedCount > 0
        ? Math.round((stats.completedCount / stats.finishedCount) * 100)
        : 0;

    return {
      upcomingCount: stats.upcomingCount,
      todayCount: stats.todayCount,
      totalSessions: stats.totalSessions,
      activeStudents: activeStudentsResult.length,
      completionRate,
    };
  }

  async getUpcomingBookings(mentorId: string, limit = 10): Promise<IMentorBooking[]> {
    const now = new Date();
    return this.model
      .find({
        mentorId: new Types.ObjectId(mentorId),
        status: BookingStatus.CONFIRMED,
        startTime: { $gt: now },
      })
      .sort({ startTime: 1 })
      .limit(limit)
      .populate('studentId', 'fullName email avatarUrl')
      .exec();
  }
}
