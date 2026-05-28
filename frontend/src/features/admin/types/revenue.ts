export interface RevenueMetricsDto {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscribers: number;
  failedPaymentsCount: number;
}

export interface RevenueTrendPointDto {
  date: string;
  revenue: number;
}

export interface PlanPerformanceDto {
  planId: string;
  planName: string;
  activeSubscribers: number;
  totalRevenue: number;
}

export interface RecentPaymentDto {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  planName: string | null;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed';
  date: string;
}

export interface PaginatedPaymentsDto {
  payments: RecentPaymentDto[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}
