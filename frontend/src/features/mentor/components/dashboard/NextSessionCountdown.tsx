import { useEffect, useState } from 'react';
import type { DashboardUpcomingSession } from '../../types/booking';

interface Props {
  upcoming: DashboardUpcomingSession[];
}

const NextSessionCountdown = ({ upcoming }: Props) => {
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    const compute = () => {
      if (upcoming.length === 0) { setDisplay(null); return; }
      const now = Date.now();

      // Find the first session that's today or in the future
      const next = upcoming.find(b => new Date(b.endTime).getTime() > now);
      if (!next) { setDisplay(null); return; }

      const startMs = new Date(next.startTime).getTime();
      const endMs = new Date(next.endTime).getTime();

      if (now >= startMs && now <= endMs) {
        setDisplay('🟢 Session in progress');
        return;
      }

      const diffMs = startMs - now;
      if (diffMs <= 0) { setDisplay(null); return; }

      const diffMin = Math.floor(diffMs / 60000);
      const diffHr = Math.floor(diffMin / 60);
      const remMin = diffMin % 60;

      if (diffHr > 0) {
        setDisplay(`⏱ Next session starts in ${diffHr}h ${remMin}m`);
      } else {
        setDisplay(`⏱ Next session starts in ${diffMin}m`);
      }
    };

    compute();
    const id = setInterval(compute, 30000);
    return () => clearInterval(id);
  }, [upcoming]);

  if (!display) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
      {display}
    </div>
  );
};

export default NextSessionCountdown;
