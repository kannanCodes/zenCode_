import type { PlanPerformanceDto } from '../../types/revenue';

interface Props {
  plans: PlanPerformanceDto[];
}

const PlanPerformanceCard = ({ plans }: Props) => {
  const totalRevenue = plans.reduce((sum, p) => sum + p.totalRevenue, 0);

  return (
    <div className="rounded-xl border border-[#1c1c1c] bg-[#0f0f0f] p-6 h-full flex flex-col">
      <h3 className="text-white text-lg font-bold mb-6">Plan Performance</h3>
      <div className="space-y-6 flex-1">
        {plans.length === 0 ? (
          <p className="text-gray-500 text-sm font-mono">No plan data available.</p>
        ) : (
          plans.map((plan) => {
            const percentage = totalRevenue > 0 ? (plan.totalRevenue / totalRevenue) * 100 : 0;
            
            return (
              <div key={plan.planId}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 font-bold">{plan.planName}</span>
                    <span className="text-xs text-gray-500 font-mono">({plan.activeSubscribers} active)</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-sm font-bold">
                    ₹{plan.totalRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-full bg-[#1c1c1c] rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PlanPerformanceCard;
