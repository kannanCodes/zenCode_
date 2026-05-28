import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import type { DashboardUpcomingSession } from '../../types/booking';
import { mentorBookingApi } from '../../services/mentorBookingApi';
import { canJoinSession, canCancelSession, getSessionHelperText } from '../../../../shared/utils/session-access.util';
import { showError, showSuccess } from '../../../../shared/utils/toast.util';

interface Props {
  sessions: DashboardUpcomingSession[];
  isLoading: boolean;
  error: string | null;
  onCancel: () => void;
}

const getInitial = (name?: string, email?: string) =>
  ((name || email || '?').charAt(0)).toUpperCase();

const getAvatarColor = (name: string) => {
  const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-cyan-600', 'bg-emerald-600', 'bg-amber-600', 'bg-pink-600'];
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return colors[hash % colors.length];
};

const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-4 py-3 border-b border-[#1c1c1c] animate-pulse">
    <div className="w-9 h-9 rounded-full bg-[#1c1c1c]" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 bg-[#1c1c1c] rounded w-32" />
      <div className="h-2.5 bg-[#1c1c1c] rounded w-48" />
    </div>
    <div className="h-7 bg-[#1c1c1c] rounded w-24" />
  </div>
);

const UpcomingSessionsPanel = ({ sessions, isLoading, error, onCancel }: Props) => {
  const navigate = useNavigate();
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleJoin = async (booking: DashboardUpcomingSession) => {
    setEnteringId(booking._id);
    try {
      const res = await mentorBookingApi.createSession(booking._id);
      navigate(`/mentor/session/${res.data.roomId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showError(msg || 'Failed to join session');
    } finally {
      setEnteringId(null);
    }
  };

  const handleCancel = async (booking: DashboardUpcomingSession) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Cancel Session?',
      text: 'The candidate will be notified about this cancellation.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it',
      cancelButtonText: 'Keep session',
      background: '#111111',
      color: '#e5e7eb',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#374151',
    });
    if (!isConfirmed) return;
    setCancellingId(booking._id);
    try {
      await mentorBookingApi.cancelBooking(booking._id);
      showSuccess('Session cancelled');
      onCancel();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showError(msg || 'Failed to cancel');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-[#1c1c1c] bg-[#111111] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c1c1c]">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-indigo-500 block" />
          <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-widest">
            Upcoming Sessions
          </h2>
        </div>
        <span className="text-xs text-gray-600 font-mono">Next {sessions.length > 0 ? `${sessions.length}` : '–'} confirmed</span>
      </div>

      {/* Body */}
      {isLoading ? (
        <div>
          {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : error ? (
        <div className="px-5 py-8 text-center text-red-400 text-sm font-mono">
          ⚠ {error}
        </div>
      ) : sessions.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-gray-500 text-sm font-mono">No upcoming sessions scheduled.</p>
          <p className="text-gray-600 text-xs mt-1">Students can book from your profile page.</p>
        </div>
      ) : (
        <div>
          {sessions.map((booking, idx) => {
            const student = booking.studentId;
            const name = student.fullName || student.email;
            const initial = getInitial(student.fullName, student.email);
            const avatarColor = getAvatarColor(name);
            const startDate = new Date(booking.startTime);
            const endDate = new Date(booking.endTime);
            const dateStr = startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            const startTime = startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            const endTime = endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            const durationMin = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
            const isToday = startDate.toDateString() === new Date().toDateString();

            const canJoin = canJoinSession(booking);
            const canCancel = canCancelSession(booking);
            const helperText = getSessionHelperText(booking);
            const isEntering = enteringId === booking._id;
            const isCancelling = cancellingId === booking._id;

            return (
              <div
                key={booking._id}
                className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#141414] ${idx < sessions.length - 1 ? 'border-b border-[#1c1c1c]' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                  {initial}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white text-sm font-semibold truncate">{name}</span>
                    {isToday && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 font-mono">Today</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {dateStr} · {startTime} – {endTime} · {durationMin}m
                  </div>
                  {helperText && (
                    <div className="text-xs text-gray-600 font-mono mt-0.5 italic">{helperText}</div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {canCancel && (
                    <button
                      onClick={() => handleCancel(booking)}
                      disabled={isCancelling}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 font-mono"
                    >
                      {isCancelling ? '…' : 'Cancel'}
                    </button>
                  )}
                  {canJoin ? (
                    <button
                      onClick={() => handleJoin(booking)}
                      disabled={isEntering}
                      className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-50 font-mono flex items-center gap-1.5"
                    >
                      {isEntering ? (
                        <>
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Joining…
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Join
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-600 font-mono px-2">
                      {helperText ? '' : 'Upcoming'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingSessionsPanel;
