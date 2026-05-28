import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { adminRevenueApi } from '../services/adminRevenueApi';
import type { RevenueMetricsDto, RevenueTrendPointDto, PlanPerformanceDto, PaginatedPaymentsDto } from '../types/revenue';
import RevenueMetricsCards from '../components/revenue/RevenueMetricsCards';
import RevenueTrendChart from '../components/revenue/RevenueTrendChart';
import PlanPerformanceCard from '../components/revenue/PlanPerformanceCard';
import RecentPaymentsFeed from '../components/revenue/RecentPaymentsFeed';

const RevenueMonitoringPage = () => {
  const [metrics, setMetrics] = useState<RevenueMetricsDto | null>(null);
  const [trend, setTrend] = useState<RevenueTrendPointDto[]>([]);
  const [plans, setPlans] = useState<PlanPerformanceDto[]>([]);
  const [payments, setPayments] = useState<PaginatedPaymentsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [metricsRes, trendRes, plansRes, paymentsRes] = await Promise.allSettled([
          adminRevenueApi.getMetrics(),
          adminRevenueApi.getTrend(30),
          adminRevenueApi.getPlanPerformance(),
          adminRevenueApi.getRecentPayments(1, 15) // Fetch first 15 for feed
        ]);

        if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value);
        if (trendRes.status === 'fulfilled') setTrend(trendRes.value);
        if (plansRes.status === 'fulfilled') setPlans(plansRes.value);
        if (paymentsRes.status === 'fulfilled') setPayments(paymentsRes.value);
        
      } catch (err: any) {
        setError('An unexpected error occurred while fetching revenue data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="min-h-screen bg-black flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        <div className="bg-[#0a0a0a] border-b border-[#1c1c1c] px-6 py-5 shrink-0">
          <h1 className="text-white text-2xl font-bold tracking-tight">Revenue Dashboard</h1>
          <p className="text-gray-500 text-xs font-mono mt-0.5">
            Real-time financial and subscription metrics
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl font-mono text-sm">
              {error}
            </div>
          )}

          {/* Top Cards */}
          {isLoading && !metrics ? (
            <div className="animate-pulse flex gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex-1 h-32 bg-[#1c1c1c] rounded-xl"></div>
              ))}
            </div>
          ) : metrics ? (
            <RevenueMetricsCards metrics={metrics} />
          ) : null}

          {/* Middle Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[400px]">
            <div className="lg:col-span-2 flex flex-col">
              {isLoading && !trend.length ? (
                <div className="animate-pulse w-full h-full min-h-[400px] bg-[#1c1c1c] rounded-xl"></div>
              ) : (
                <RevenueTrendChart data={trend} />
              )}
            </div>
            <div className="flex flex-col">
              {isLoading && !plans.length ? (
                <div className="animate-pulse w-full h-full min-h-[400px] bg-[#1c1c1c] rounded-xl"></div>
              ) : (
                <PlanPerformanceCard plans={plans} />
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="h-[500px]">
             {isLoading && !payments ? (
                <div className="animate-pulse w-full h-full bg-[#1c1c1c] rounded-xl"></div>
              ) : payments ? (
                <RecentPaymentsFeed payments={payments.payments} />
              ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueMonitoringPage;
