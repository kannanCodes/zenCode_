import type { DashboardUpcomingSession } from '../../types/booking';

interface Props {
  sessions: DashboardUpcomingSession[];
  isLoading: boolean;
  error: string | null;
}

const getAvatarColor = (name: string) => {
  const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-cyan-600', 'bg-emerald-600', 'bg-amber-600', 'bg-pink-600'];
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return colors[hash % colors.length];
};

const TodayTimeline = ({ sessions, isLoading, error }: Props) => {
  const now = new Date();
  const todayStr = now.toDateString();

  const todaySessions = sessions
    .filter(b => new Date(b.startTime).toDateString() === todayStr)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="rounded-xl border border-[#1c1c1c] bg-[#111111] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c1c1c]">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-amber-500 block" />
          <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-widest">
            Today's Schedule
          </h2>
        </div>
        <span className="text-xs text-gray-600 font-mono">
          {now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="p-5 space-y-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-3 bg-[#1c1c1c] rounded w-16" />
              <div className="flex-1 h-3 bg-[#1c1c1c] rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="px-5 py-8 text-center text-red-400 text-sm font-mono">
          ⚠ {error}
        </div>
      ) : todaySessions.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <div className="text-3xl mb-2">☀️</div>
          <p className="text-gray-500 text-sm font-mono">No sessions scheduled today.</p>
          <p className="text-gray-600 text-xs mt-1">Enjoy your free day!</p>
        </div>
      ) : (
        <div className="p-5 space-y-1">
          {todaySessions.map((booking) => {
            const student = booking.studentId;
            const name = student.fullName || student.email;
            const startDate = new Date(booking.startTime);
            const endDate = new Date(booking.endTime);
            const startTime = startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            const nowMs = Date.now();
            const isActive = nowMs >= startDate.getTime() && nowMs <= endDate.getTime();
            const isPast = nowMs > endDate.getTime();
            const avatarColor = getAvatarColor(name);
            const initial = (name.charAt(0)).toUpperCase();

            return (
              <div
                key={booking._id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-500/10 border border-indigo-500/20'
                    : isPast
                    ? 'opacity-40'
                    : 'hover:bg-[#141414]'
                }`}
              >
                {/* Time */}
                <span className={`text-xs font-mono w-16 shrink-0 ${isActive ? 'text-indigo-400 font-semibold' : 'text-gray-500'}`}>
                  {startTime}
                </span>

                {/* Line / pulse indicator */}
                <div className="flex flex-col items-center shrink-0">
                  {isActive ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500" />
                    </span>
                  ) : (
                    <span className={`h-2 w-2 rounded-full ${isPast ? 'bg-gray-700' : 'bg-gray-600'}`} />
                  )}
                </div>

                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {initial}
                </div>

                {/* Name */}
                <span className={`text-sm font-mono truncate ${isActive ? 'text-white font-semibold' : isPast ? 'text-gray-600' : 'text-gray-300'}`}>
                  {name}
                </span>

                {/* Active badge */}
                {isActive && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono shrink-0">
                    In Progress
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TodayTimeline;
