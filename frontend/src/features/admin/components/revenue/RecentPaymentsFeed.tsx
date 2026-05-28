import type { RecentPaymentDto } from '../../types/revenue';

interface Props {
  payments: RecentPaymentDto[];
}

const RecentPaymentsFeed = ({ payments }: Props) => {
  return (
    <div className="rounded-xl border border-[#1c1c1c] bg-[#0f0f0f] flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-[#1c1c1c]">
        <h3 className="text-white text-lg font-bold">Recent Payments Feed</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {payments.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm font-mono">
            No recent payments.
          </div>
        ) : (
          <div className="divide-y divide-[#1c1c1c]">
            {payments.map((payment) => (
              <div key={payment.id} className="p-4 hover:bg-[#141414] transition-colors group flex items-center justify-between rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    payment.status === 'succeeded' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {payment.status === 'succeeded' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-200 font-bold text-sm">{payment.user.name}</span>
                      {payment.status === 'succeeded' ? (
                        <span className="text-emerald-400 text-xs font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">Success</span>
                      ) : (
                        <span className="text-red-400 text-xs font-mono bg-red-500/10 px-1.5 py-0.5 rounded">Failed</span>
                      )}
                    </div>
                    <div className="text-gray-500 text-xs font-mono mt-1">
                      {payment.planName ? `Plan: ${payment.planName}` : 'Unknown Plan'} • {new Date(payment.date).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-mono font-bold ${payment.status === 'succeeded' ? 'text-emerald-400' : 'text-red-400'}`}>
                    ₹{payment.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-gray-600 text-xs font-mono uppercase mt-1">
                    {payment.currency}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentPaymentsFeed;
