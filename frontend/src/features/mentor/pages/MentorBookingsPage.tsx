import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mentorBookingApi } from '../services/mentorBookingApi';
import type { BookingUser, MentorBooking } from '../types/booking';
import { showError, showSuccess } from '../../../shared/utils/toast.util';

const SESSION_JOIN_EARLY_MS = 5 * 60 * 1000;
const SESSION_JOIN_GRACE_MS = 30 * 60 * 1000;

const getDisplayUser = (user: BookingUser | null | undefined, fallback: string) => ({
  name: user?.fullName || user?.email || fallback,
  email: user?.email || '',
  avatarUrl: user?.avatarUrl,
  initial: (user?.fullName || user?.email || fallback).charAt(0).toUpperCase(),
});

const getStatusMeta = (status: MentorBooking['status'], isPastWindow: boolean) => {
  if (status === 'confirmed' && !isPastWindow) {
    return { label: 'Confirmed', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  }
  if (status === 'pending') {
    return { label: 'Pending', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
  }
  if (status === 'cancelled') {
    return { label: 'Cancelled', className: 'bg-red-500/10 text-red-400 border-red-500/20' };
  }
  if (status === 'no_show') {
    return { label: 'No-show', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
  }
  if (status === 'expired') {
    return { label: 'Expired', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
  }
  if (status === 'completed' || isPastWindow) {
    return { label: 'Session closed', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
  }
  return { label: status, className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
};

const MentorBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<MentorBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnteringSession, setIsEnteringSession] = useState<string | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const res = await mentorBookingApi.getMentorBookings();
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      showError('Failed to load your bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterSession = async (booking: MentorBooking) => {
    try {
      setIsEnteringSession(booking._id);
      // Create or get the session room for this booking
      const res = await mentorBookingApi.createSession(booking._id);
      
      const roomId = res.data.roomId;
      showSuccess('Entering session room...');
      navigate(`/mentor/session/${roomId}`);
    } catch (error: unknown) {
      const msg =
        error instanceof Object && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      showError(msg || 'Failed to enter session room.');
    } finally {
      setIsEnteringSession(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancellingBookingId(bookingId);
      await mentorBookingApi.cancelBooking(bookingId);
      setBookings(prev =>
        prev.map(booking =>
          booking._id === bookingId ? { ...booking, status: 'cancelled' } : booking
        )
      );
      showSuccess('Booking cancelled successfully');
    } catch (error: unknown) {
      const msg =
        error instanceof Object && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      showError(msg || 'Failed to cancel booking.');
    } finally {
      setCancellingBookingId(null);
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-gray-400">Loading bookings...</div>;
  }

  // Sort bookings: upcoming first (closest to now), then past
  const sortedBookings = [...bookings].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  const upcomingBookings = sortedBookings.filter((booking) => {
    const joinClosesAt = new Date(booking.endTime).getTime() + SESSION_JOIN_GRACE_MS;
    return joinClosesAt >= now.getTime() && (booking.status === 'confirmed' || booking.status === 'pending');
  });
  const pastBookings = sortedBookings.filter(b => !upcomingBookings.some(upcoming => upcoming._id === b._id));

  const renderBookingCard = (booking: MentorBooking, isUpcoming: boolean) => {
    const student = getDisplayUser(booking.studentId, 'Deleted student');
    const startDate = new Date(booking.startTime);
    const endDate = new Date(booking.endTime);
    const nowMs = now.getTime();
    const startsAt = startDate.getTime();
    const endsAt = endDate.getTime();
    const joinClosesAt = endsAt + SESSION_JOIN_GRACE_MS;
    
    // Time formatting in user's local timezone
    const dateStr = startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const startTimeStr = startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    const canEnterSession =
      booking.status === 'confirmed' &&
      nowMs >= startsAt - SESSION_JOIN_EARLY_MS &&
      nowMs < joinClosesAt;
    const isLiveWindow = nowMs >= startsAt - SESSION_JOIN_EARLY_MS && nowMs < endsAt;
    const isGraceWindow = nowMs >= endsAt && nowMs < joinClosesAt;
    const canCancel =
      booking.status === 'confirmed' &&
      nowMs < startsAt;
    const isPastWindow = nowMs >= joinClosesAt || booking.status === 'completed';
    const statusMeta = getStatusMeta(booking.status, isPastWindow);
    const helperText =
      booking.status === 'pending'
        ? 'Awaiting confirmation'
        : nowMs < startsAt - SESSION_JOIN_EARLY_MS
        ? 'Available 5 mins before start'
        : isGraceWindow
        ? 'Session ended · rejoin window active'
        : nowMs >= joinClosesAt
        ? 'Session window closed'
        : null;
    const actionLabel =
      isEnteringSession === booking._id
        ? 'Joining...'
        : isGraceWindow
        ? 'Rejoin Session'
        : isLiveWindow
        ? 'Enter Session'
        : 'Enter Session';

    return (
      <div key={booking._id} className="bg-[#111111] border border-[#272b3a] rounded-lg p-5 flex flex-col md:flex-row justify-between md:items-center gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1a1d26] border border-[#272b3a] flex-shrink-0 flex items-center justify-center">
             {student.avatarUrl ? (
               <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
             ) : (
               <span className="text-[var(--color-primary)] font-bold">{student.initial}</span>
             )}
          </div>
          
          <div className="min-w-0">
            <h3 className="font-bold text-white text-lg truncate">{student.name}</h3>
            {student.email && student.email !== student.name && (
              <p className="text-xs text-gray-500 truncate">{student.email}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded border text-xs font-bold ${statusMeta.className}`}>
                {statusMeta.label}
              </span>
              <span className="text-gray-400 text-sm">
                {dateStr} • {startTimeStr} - {endTimeStr}
              </span>
            </div>
          </div>
        </div>

        {isUpcoming && booking.status === 'confirmed' ? (
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => handleEnterSession(booking)}
              disabled={!canEnterSession || isEnteringSession === booking._id}
              className={`px-6 py-2.5 rounded-lg font-bold transition-all ${
                canEnterSession 
                  ? 'bg-[var(--color-primary)] hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(45,95,255,0.25)]' 
                  : 'bg-[#1a1d26] text-gray-500 cursor-not-allowed border border-[#272b3a]'
              }`}
            >
              {actionLabel}
            </button>
            {helperText && !canEnterSession && (
              <span className="text-xs text-gray-500 md:self-center">{helperText}</span>
            )}
            {canCancel && (
              <button
                onClick={() => handleCancelBooking(booking._id)}
                disabled={cancellingBookingId === booking._id}
                className="px-5 py-2.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors"
              >
                {cancellingBookingId === booking._id ? 'Cancelling...' : 'Cancel'}
              </button>
            )}
          </div>
        ) : (
          <div className="w-full md:w-auto px-4 py-2 rounded-lg bg-[#1a1d26] border border-[#272b3a] text-center text-sm text-gray-500 font-medium">
            {helperText || statusMeta.label}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">My Bookings</h1>
        <p className="text-gray-400">Manage your upcoming and past mock interview sessions.</p>
      </div>

      <div className="space-y-12">
        {/* Upcoming Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
               <div className="w-3 h-3 rounded-full bg-[var(--color-primary)] animate-pulse"></div>
            </div>
            <h2 className="text-xl font-bold text-white">Upcoming Sessions</h2>
          </div>
          
          <div className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <div className="bg-[#111111] border border-[#272b3a] rounded-xl p-8 text-center text-gray-500 border-dashed">
                You have no upcoming confirmed bookings.
              </div>
            ) : (
              upcomingBookings.map(b => renderBookingCard(b, true))
            )}
          </div>
        </section>

        {/* Past Section */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">Past Sessions</h2>
          <div className="space-y-4">
            {pastBookings.length === 0 ? (
              <div className="bg-[#111111] border border-[#272b3a] rounded-xl p-8 text-center text-gray-500 border-dashed">
                No past bookings found.
              </div>
            ) : (
              pastBookings.map(b => renderBookingCard(b, false))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MentorBookingsPage;
