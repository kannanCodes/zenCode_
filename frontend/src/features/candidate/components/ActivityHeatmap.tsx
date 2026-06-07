import { useMemo, useState } from 'react';
import type { HeatmapDay } from '../services/dashboard.service';

interface Props {
  data: HeatmapDay[];
}

const WEEKS = 26;
const DAYS_IN_WEEK = 7;
const TOTAL_DAYS = WEEKS * DAYS_IN_WEEK;

function getIntensity(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  return 3;
}

const INTENSITY_COLORS = [
  '#1a1d26', // 0 — empty
  '#1e3a8a', // 1 — low
  '#2563eb', // 2 — mid
  '#2D5FFF', // 3 — high
];

function toUTCDateString(date: Date): string {
  return date.toISOString().substring(0, 10);
}

export const ActivityHeatmap = ({ data }: Props) => {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  const countMap = useMemo(() => {
    const m = new Map<string, number>();
    data.forEach((d) => m.set(d.date, d.count));
    return m;
  }, [data]);

  // Build grid: WEEKS columns × 7 rows (Mon→Sun), most recent week on the right
  const cells = useMemo(() => {
    const today = new Date();
    // Snap today to its UTC date so the grid aligns correctly
    const startDate = new Date(toUTCDateString(today));
    startDate.setUTCDate(startDate.getUTCDate() - (TOTAL_DAYS - 1));

    return Array.from({ length: TOTAL_DAYS }, (_, i) => {
      const d = new Date(startDate);
      d.setUTCDate(startDate.getUTCDate() + i);
      const dateStr = toUTCDateString(d);
      return {
        date: dateStr,
        count: countMap.get(dateStr) ?? 0,
        week: Math.floor(i / DAYS_IN_WEEK),
        day: i % DAYS_IN_WEEK,
      };
    });
  }, [countMap]);

  const formatTooltip = (dateStr: string, count: number) => {
    const d = new Date(dateStr + 'T00:00:00Z');
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    return count === 0 ? `No submissions on ${label}` : `${count} submission${count > 1 ? 's' : ''} on ${label}`;
  };

  return (
    <div className="relative">
      {/* Grid */}
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: WEEKS }, (_, week) =>
          Array.from({ length: DAYS_IN_WEEK }, (_, day) => {
            const cell = cells[week * DAYS_IN_WEEK + day];
            const intensity = getIntensity(cell.count);
            return (
              <div
                key={cell.date}
                className="rounded-[2px] cursor-pointer transition-opacity hover:opacity-80"
                style={{
                  width: '100%',
                  paddingBottom: '100%',
                  backgroundColor: INTENSITY_COLORS[intensity],
                  gridColumn: week + 1,
                  gridRow: day + 1,
                }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({ date: cell.date, count: cell.count, x: rect.left + rect.width / 2, y: rect.top - 8 });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-3 justify-end">
        <span className="text-xs text-gray-500 mr-1">Less</span>
        {INTENSITY_COLORS.map((color, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-[2px]"
            style={{ backgroundColor: color }}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1 text-xs text-white bg-[#1a1d26] border border-[#2a2d3a] rounded-md shadow-lg pointer-events-none -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {formatTooltip(tooltip.date, tooltip.count)}
        </div>
      )}
    </div>
  );
};
