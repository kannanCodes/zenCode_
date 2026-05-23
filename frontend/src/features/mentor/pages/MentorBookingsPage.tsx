import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mentorBookingApi } from '../services/mentorBookingApi';
import type { MentorBooking } from '../types/booking';
import { showError, showSuccess } from '../../../shared/utils/toast.util';

const MentorBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<MentorBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnteringSession, setIsEnteringSession] = useState<string | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const res = await mentorBookingApi.getMentorBookings();
      setBookings(res.data || []);
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

  const now = new Date();
  
  // Sort bookings: upcoming first (closest to now), then past
  const sortedBookings = [...bookings].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  const upcomingBookings = sortedBookings.filter(b => new Date(b.endTime) >= now && b.status === 'confirmed');
  const pastBookings = sortedBookings.filter(b => new Date(b.endTime) < now || b.status !== 'confirmed');

  const renderBookingCard = (booking: MentorBooking, isUpcoming: boolean) => {
    const startDate = new Date(booking.startTime);
    const endDate = new Date(booking.endTime);
    
    // Time formatting in user's local timezone
    const dateStr = startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const startTimeStr = startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    // Enable button 5 mins before start time
    const canEnterSession = isUpcoming && (startDate.getTime() - now.getTime() <= 5 * 60 * 1000);

    return (
      <div key={booking._id} className="bg-[#111111] border border-[#272b3a] rounded-xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1a1d26] border border-[#272b3a] flex-shrink-0 flex items-center justify-center">
             {booking.studentId.avatarUrl ? (
               <img src={booking.studentId.avatarUrl} alt={booking.studentId.fullName || 'Student'} className="w-full h-full object-cover" />
             ) : (
               <span className="text-[var(--color-primary)] font-bold">{booking.studentId.fullName?.charAt(0).toUpperCase() || 'S'}</span>
             )}
          </div>
          
          {/* Details */}
          <div>
            <h3 className="font-bold text-white text-lg">{booking.studentId.fullName || booking.studentId.email}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#1a1d26] text-gray-400">
                {booking.status.toUpperCase()}
              </span>
              <span className="text-gray-400 text-sm">
                {dateStr} • {startTimeStr} - {endTimeStr}
              </span>
            </div>
          </div>
        </div>

        {isUpcoming ? (
          <div className="flex flex-col md:flex-row items-end gap-3">
            <button
              onClick={() => handleEnterSession(booking)}
              disabled={!canEnterSession || isEnteringSession === booking._id}
              className={`px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg ${
                canEnterSession 
                  ? 'bg-[var(--color-primary)] hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(45,95,255,0.4)]' 
                  : 'bg-[#1a1d26] text-gray-500 cursor-not-allowed border border-[#272b3a]'
              }`}
            >
              {isEnteringSession === booking._id ? 'Joining...' : 'Enter Session'}
            </button>
            {!canEnterSession && (
              <span className="text-xs text-gray-500 mt-2">Available 5 mins before start</span>
            )}
            <button
              onClick={() => handleCancelBooking(booking._id)}
              disabled={cancellingBookingId === booking._id}
              className="px-5 py-2.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors"
            >
              {cancellingBookingId === booking._id ? 'Cancelling...' : 'Cancel'}
            </button>
          </div>
        ) : (
           <div className="text-gray-500 text-sm font-medium">
             Completed
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
