import type { DailyDataPoint } from '../../types/dashboard';

interface Props {
  data: DailyDataPoint[];
  isLoading: boolean;
  error: string | null;
}

const CHART_HEIGHT = 120;
const CHART_WIDTH = 460;

function buildPath(points: DailyDataPoint[], max: number): string {
  if (points.length === 0) return '';
  const step = CHART_WIDTH / Math.max(points.length - 1, 1);
  return points
    .map((p, i) => {
      const x = i * step;
      const y = max > 0 ? CHART_HEIGHT - (p.value / max) * CHART_HEIGHT : CHART_HEIGHT;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function buildAreaPath(points: DailyDataPoint[], max: number): string {
  if (points.length === 0) return '';
  const step = CHART_WIDTH / Math.max(points.length - 1, 1);
  const linePart = points
    .map((p, i) => {
      const x = i * step;
      const y = max > 0 ? CHART_HEIGHT - (p.value / max) * CHART_HEIGHT : CHART_HEIGHT;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const lastX = (points.length - 1) * step;
  return `${linePart} L${lastX.toFixed(1)},${CHART_HEIGHT} L0,${CHART_HEIGHT} Z`;
}

const Skeleton = () => (
  <div className="rounded-xl border border-[#1c1c1c] bg-[#0f0f0f] p-5 animate-pulse">
    <div className="h-4 bg-[#1c1c1c] rounded w-36 mb-4" />
    <div className="h-[120px] bg-[#1c1c1c] rounded" />
  </div>
);

const UserGrowthChart = ({ data, isLoading, error }: Props) => {
  if (isLoading) return <Skeleton />;

  if (error || data.length === 0) {
    return (
      <div className="rounded-xl border border-[#1c1c1c] bg-[#0f0f0f] p-5 flex flex-col h-full">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-4">User Growth (30d)</p>
        {error ? (
          <div className="flex-1 flex items-center justify-center text-red-400 text-xs font-mono">⚠ {error}</div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-700 text-xs font-mono">No data yet</div>
        )}
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((s, d) => s + d.value, 0);
  const linePath = buildPath(data, max);
  const areaPath = buildAreaPath(data, max);

  const labelIndices = [0, Math.floor(data.length / 2), data.length - 1];

  return (
    <div className="rounded-xl border border-indigo-500/10 bg-[#0f0f0f] p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">User Growth (30d)</p>
          <p className="text-xl font-bold text-indigo-400 mt-0.5">+{total.toLocaleString()} users</p>
        </div>
        <span className="text-indigo-400 bg-[#1a1d26] p-1.5 rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </span>
      </div>

      {/* SVG */}
      <div className="flex-1">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          preserveAspectRatio="none"
          className="w-full"
          style={{ height: '100px' }}
        >
          <defs>
            <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#growthGrad)" />
          <path d={linePath} fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>

        <div className="flex justify-between mt-1">
          {data.map((d, i) =>
            labelIndices.includes(i) ? (
              <span key={i} className="text-[10px] text-gray-600 font-mono">
                {d.date.slice(5)}
              </span>
            ) : (
              <span key={i} />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default UserGrowthChart;
