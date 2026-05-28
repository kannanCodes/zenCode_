import type { RevenueTrendPointDto } from '../../types/revenue';

interface Props {
  data: RevenueTrendPointDto[];
}

const RevenueTrendChart = ({ data }: Props) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue), 100);
  const minRevenue = 0;

  const width = 1000;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 30, left: 60 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - ((d.revenue - minRevenue) / (maxRevenue - minRevenue)) * graphHeight;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M ${points[0].split(',')[0]},${padding.top + graphHeight} L ${points.join(' L ')} L ${points[points.length - 1].split(',')[0]},${padding.top + graphHeight} Z`;

  const total = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="rounded-xl border border-[#1c1c1c] bg-[#0f0f0f] p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Revenue Trend (30d)</p>
          <p className="text-xl font-bold text-emerald-400 mt-0.5">₹{total.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="flex-1 relative w-full h-full min-h-[300px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + graphHeight * (1 - ratio);
            const value = minRevenue + (maxRevenue - minRevenue) * ratio;
            return (
              <g key={i}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#1c1c1c" strokeWidth="1" strokeDasharray="4 4" />
                <text x={padding.left - 10} y={y + 4} fill="#6b7280" fontSize="11" textAnchor="end" className="font-mono">
                  {value >= 1000 ? `₹${(value / 1000).toFixed(1)}k` : `₹${Math.round(value)}`}
                </text>
              </g>
            );
          })}

          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area */}
          <path d={areaD} fill="url(#revenueGradient)" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />

          {/* X Axis labels */}
          {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((d, i) => {
            const x = padding.left + (data.indexOf(d) / (data.length - 1)) * graphWidth;
            const date = new Date(d.date);
            return (
              <text key={i} x={x} y={height - 5} fill="#6b7280" fontSize="11" textAnchor="middle" className="font-mono">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default RevenueTrendChart;
