import { Types } from 'mongoose';
import { IAdminRevenueRepository } from '../../interfaces/repository-interfaces/admin/IAdminRevenueRepository';
import {
  RevenueMetricsDto,
  RevenueTrendPointDto,
  PlanPerformanceDto,
  PaginatedPaymentsDto,
  RecentPaymentDto,
} from '../../dtos/admin/admin-revenue.dto';
import { PaymentTransaction, IPaymentTransaction } from '../../infrastructure/database/models/payment-transaction.model';
import { Subscription } from '../../infrastructure/database/models/subscription.model';
import Plan, { IPlanDocument } from '../../infrastructure/database/models/plan.model';

export class AdminRevenueRepository implements IAdminRevenueRepository {
  async getMetrics(): Promise<RevenueMetricsDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalRevResult, monthlyRevResult, activeSubs, failedResult] = await Promise.all([
      PaymentTransaction.aggregate([
        { $match: { status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      PaymentTransaction.aggregate([
        { $match: { status: 'succeeded', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Subscription.countDocuments({ status: 'active' }),
      PaymentTransaction.countDocuments({ status: 'failed' }),
    ]);

    return {
      totalRevenue: totalRevResult[0]?.total || 0,
      monthlyRevenue: monthlyRevResult[0]?.total || 0,
      activeSubscribers: activeSubs,
      failedPaymentsCount: failedResult,
    };
  }

  async getTrend(days: number): Promise<RevenueTrendPointDto[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await PaymentTransaction.aggregate([
      {
        $match: {
          status: 'succeeded',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing dates with 0
    const trend: RevenueTrendPointDto[] = [];
    const curr = new Date(startDate);
    const end = new Date();
    
    // Create map for quick lookup
    const dataMap = new Map<string, number>();
    for (const d of data) {
      dataMap.set(d._id, d.revenue);
    }

    while (curr <= end) {
      const dateStr = curr.toISOString().split('T')[0];
      trend.push({
        date: dateStr,
        revenue: dataMap.get(dateStr) || 0,
      });
      curr.setDate(curr.getDate() + 1);
    }

    return trend;
  }

  async getPlanPerformance(): Promise<PlanPerformanceDto[]> {
    const plans = await Plan.find({}).lean();
    
    const [subCounts, revenueAgg] = await Promise.all([
      Subscription.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$planId', count: { $sum: 1 } } },
      ]),
      PaymentTransaction.aggregate([
        { $match: { status: 'succeeded' } },
        { $group: { _id: '$planId', total: { $sum: '$amount' } } },
      ]),
    ]);

    const subCountMap = new Map<string, number>();
    for (const sc of subCounts) {
      subCountMap.set(sc._id?.toString(), sc.count);
    }

    const revMap = new Map<string, number>();
    for (const r of revenueAgg) {
      revMap.set(r._id?.toString(), r.total);
    }

    return plans.map((p: IPlanDocument) => ({
      planId: p._id?.toString() || '',
      planName: p.name,
      activeSubscribers: subCountMap.get(p._id?.toString() || '') || 0,
      totalRevenue: revMap.get(p._id?.toString() || '') || 0,
    }));
  }

  async getRecentPayments(page: number, limit: number): Promise<PaginatedPaymentsDto> {
    const skip = (page - 1) * limit;

    const [totalCount, transactions] = await Promise.all([
      PaymentTransaction.countDocuments({}),
      PaymentTransaction.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'fullName email')
        .populate('planId', 'name')
        .lean(),
    ]);

    type PopulatedTransaction = IPaymentTransaction & {
      userId?: { _id?: Types.ObjectId; fullName?: string; email?: string };
      planId?: { name?: string };
    };

    const populatedTransactions = transactions as unknown as PopulatedTransaction[];

    const payments: RecentPaymentDto[] = populatedTransactions.map((t) => ({
      id: t._id?.toString() || '',
      user: {
        id: t.userId?._id?.toString() || '',
        name: t.userId?.fullName || 'Unknown',
        email: t.userId?.email || '',
      },
      planName: t.planId?.name || null,
      amount: t.amount,
      currency: t.currency,
      status: t.status,
      date: t.createdAt.toISOString(),
    }));

    return {
      payments,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    };
  }
}
