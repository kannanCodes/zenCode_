import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { candidateBookingApi } from '../services/booking.service';
import { showError, showSuccess } from '../../../shared/utils/toast.util';
import api from '../../../shared/lib/axios';
import ReviewModal from '../../../shared/components/session/ReviewModal';
import Navbar from '../../../shared/components/Navbar';

interface Booking {
  _id: string;
  mentorId: {
    _id: string;
    fullName: string;
  };
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'expired';
}

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatTime = (isoDate: string) =>
  new Date(isoDate).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

const isAfterNow = (isoDate: string) => new Date(isoDate).getTime() > Date.now();

const canEnterBooking = (booking: Booking) =>
  booking.status === 'confirmed' &&
  Date.now() >= new Date(booking.startTime).getTime() - 5 * 60 * 1000 &&
  Date.now() < new Date(booking.endTime).getTime();

const StudentBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const reviewBookingId = searchParams.get('reviewBookingId');
  const reviewBooking = bookings.find(b => b._id === reviewBookingId);

  useEffect(() => {
    let cancelled = false;
    const fetchBookings = async () => {
      try {
        const res = await candidateBookingApi.getMyBookings();
        if (!cancelled) {
          setBookings(res.data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          showError('Failed to load bookings');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchBookings();
    return () => { cancelled = true; };
  }, []);

  const handleEnterSession = async (bookingId: string) => {
    try {
      // Re-uses mentor-session endpoint, but the backend verifies access based on candidate role.
      const response = await api.post('/mentor-sessions', { bookingId });
      const { roomId } = response.data.data;
      navigate(`/candidate/session/${roomId}`);
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to enter session');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancellingBookingId(bookingId);
      await candidateBookingApi.cancelBooking(bookingId);
      setBookings(prev =>
        prev.map(booking =>
          booking._id === bookingId ? { ...booking, status: 'cancelled' } : booking
        )
      );
      showSuccess('Booking cancelled successfully');
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingBookingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#2a2d3a] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const upcomingBookings = bookings
    .filter((booking) => isAfterNow(booking.endTime) && (booking.status === 'confirmed' || booking.status === 'pending'))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const pastBookings = bookings
    .filter((booking) => !upcomingBookings.some((upcoming) => upcoming._id === booking._id))
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold font-mono text-[var(--color-primary)]">My Sessions</h1>
          <p className="text-gray-400 mt-2">Manage your upcoming and past mentoring sessions.</p>
        </header>

        {bookings.length === 0 ? (
          <div className="bg-[#1a1d26] border border-[#2a2d3a] rounded-2xl p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">No bookings found</h2>
            <p className="text-gray-400 mb-6">You haven't booked any mentoring sessions yet.</p>
            <button
              onClick={() => navigate('/candidate/mentors')}
              className="px-6 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 font-bold transition-colors"
            >
              Discover Mentors
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            <section>
              <h2 className="text-xl font-bold text-white mb-4">Upcoming Sessions</h2>
              <div className="grid gap-4">
                {upcomingBookings.length === 0 ? (
                  <div className="bg-[#1a1d26] border border-[#2a2d3a] rounded-xl p-6 text-gray-400">
                    No upcoming sessions.
                  </div>
                ) : (
                  upcomingBookings.map((booking) => {
                    const canEnter = canEnterBooking(booking);
                    const canCancel = isAfterNow(booking.startTime) && (booking.status === 'confirmed' || booking.status === 'pending');

                    return (
                      <div key={booking._id} className="bg-[#1a1d26] border border-[#2a2d3a] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#3a3d4a] transition-colors">
                        <div>
                          <h3 className="text-lg font-bold mb-1">Session with {booking.mentorId?.fullName || 'Mentor'}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(booking.startTime)}
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </div>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' :
                              booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                              'bg-gray-500/10 text-gray-400'
                            }`}>
                              {booking.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                          {canEnter ? (
                            <button
                              onClick={() => handleEnterSession(booking._id)}
                              className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                            >
                              Enter Session
                            </button>
                          ) : (
                            <div className="text-sm text-gray-500 bg-[#111111] px-4 py-2 rounded-lg border border-[#2a2d3a]">
                              Opens 5 mins before start
                            </div>
                          )}

                          {canCancel && (
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              disabled={cancellingBookingId === booking._id}
                              className="w-full md:w-auto px-5 py-2.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors"
                            >
                              {cancellingBookingId === booking._id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Past Sessions</h2>
              <div className="grid gap-4">
                {pastBookings.length === 0 ? (
                  <div className="bg-[#1a1d26] border border-[#2a2d3a] rounded-xl p-6 text-gray-400">
                    No past sessions.
                  </div>
                ) : (
                  pastBookings.map((booking) => (
                    <div key={booking._id} className="bg-[#1a1d26] border border-[#2a2d3a] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h3 className="text-lg font-bold mb-1">Session with {booking.mentorId?.fullName || 'Mentor'}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(booking.startTime)}
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        booking.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        booking.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {reviewBooking && (
          <ReviewModal
            bookingId={reviewBooking._id}
            mentorName={reviewBooking.mentorId?.fullName || 'Mentor'}
            onClose={() => setSearchParams({})}
            onSubmitted={() => setSearchParams({})}
          />
        )}
      </div>
    </div>
  );
};

export default StudentBookingsPage;
