import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { candidateMentorApi } from '../services/mentor.service';
import type { PublicMentorResponse } from '../services/mentor.service';
import { candidateBookingApi, type MentorSlot } from '../services/booking.service';
import { mentorReviewApi } from '../services/review.service';
import type { ReviewResponse } from '../services/review.service';
import { showError, showSuccess } from '../../../shared/utils/toast.util';
import Navbar from '../../../shared/components/Navbar';
import {
  selectHasFeatureAccess,
  selectIsHydrated,
} from '../../../store/slices/subscriptionSlice';

const formatDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const findFirstAvailableDate = (weeklyAvailability: Record<string, Array<{ startTime: string; endTime: string }>> | undefined) => {
  if (!weeklyAvailability) return formatDateValue(new Date());
  for (let i = 0; i < 7; i++) {
    const date = addDays(new Date(), i);
    const weekday = WEEKDAY_NAMES[date.getDay()];
    if ((weeklyAvailability[weekday]?.length ?? 0) > 0) {
      return formatDateValue(date);
    }
  }
  return formatDateValue(new Date());
};

const formatShortWeekday = (date: Date) =>
  date.toLocaleDateString(undefined, { weekday: 'short' });

const formatShortDate = (date: Date) =>
  date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

const formatLongDate = (isoDate: string) =>
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

interface MentorAvailabilityPayload {
  timezone: string;
  weeklyAvailability: Record<string, Array<{ startTime: string; endTime: string }>>;
}

const MentorProfilePage = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  
  const [mentor, setMentor] = useState<PublicMentorResponse | null>(null);
  const [availability, setAvailability] = useState<MentorAvailabilityPayload | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const [selectedDate, setSelectedDate] = useState(formatDateValue(new Date()));
  const [availableSlots, setAvailableSlots] = useState<MentorSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<MentorSlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingAccessError, setBookingAccessError] = useState('');

  const isSubscriptionHydrated = useSelector(selectIsHydrated);
  const hasMentorBookingAccess = useSelector(selectHasFeatureAccess('mentorBooking'));

  useEffect(() => {
    if (!mentorId) return;

    let cancelled = false;
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const [mentorRes, availRes, reviewsRes] = await Promise.all([
          candidateMentorApi.getMentorDetails(mentorId),
          candidateMentorApi.getMentorAvailability(mentorId).catch(() => ({ data: null })),
          mentorReviewApi.getMentorReviews(mentorId, 1, 5).catch(() => ({ data: [], meta: { page: 1, limit: 5, total: 0, totalPages: 0 } })), // Fallback to empty if fails
        ]);
        
        if (!cancelled) {
          setMentor(mentorRes.data);
          setAvailability(availRes.data);
          setReviews(reviewsRes.data);
          setHasMore(reviewsRes.meta.page < reviewsRes.meta.totalPages);
          setPage(1);
          // Auto-select first date that has configured availability
          const firstDate = findFirstAvailableDate(availRes.data?.weeklyAvailability);
          setSelectedDate(firstDate);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          showError('Failed to load mentor profile');
          navigate('/candidate/mentors');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, [mentorId, navigate]);

  const loadMoreReviews = useCallback(async () => {
    if (!mentorId || isLoadingMore || !hasMore) return;
    
    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const res = await mentorReviewApi.getMentorReviews(mentorId, nextPage, 5);
      
      setReviews((prev) => [...prev, ...res.data]);
      setHasMore(res.meta.page < res.meta.totalPages);
      setPage(nextPage);
    } catch (error) {
      console.error(error);
      showError('Failed to load more reviews');
    } finally {
      setIsLoadingMore(false);
    }
  }, [mentorId, page, hasMore, isLoadingMore]);

  const lastReviewElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        void loadMoreReviews();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isLoadingMore, hasMore, loadMoreReviews]);

  useEffect(() => {
    if (!mentorId || !availability?.weeklyAvailability) {
      setAvailableSlots([]);
      setSelectedSlot(null);
      return;
    }

    let cancelled = false;
    const fetchSlots = async () => {
      try {
        setIsLoadingSlots(true);
        setSelectedSlot(null);
        const res = await candidateBookingApi.getMentorSlots(mentorId, selectedDate);
        if (!cancelled) {
          setAvailableSlots(res.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setAvailableSlots([]);
          showError('Failed to load available slots');
        }
      } finally {
        if (!cancelled) setIsLoadingSlots(false);
      }
    };

    fetchSlots();

    return () => { cancelled = true; };
  }, [mentorId, selectedDate, availability?.weeklyAvailability]);

  const handleBookSession = async () => {
    if (!mentorId || !selectedSlot) return;
    if (!hasMentorBookingAccess) {
      setBookingAccessError('Upgrade to Premium to confirm mentor sessions.');
      return;
    }

    try {
      setIsBooking(true);
      setBookingAccessError('');
      await candidateBookingApi.createBooking({
        mentorId,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
      });

      showSuccess('Session booked successfully!');
      navigate('/candidate/bookings');
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        setBookingAccessError(err.response?.data?.message || 'Your current plan does not include mentor booking.');
        return;
      }
      showError(err.response?.data?.message || 'Failed to book session');
    } finally {
      setIsBooking(false);
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

  if (!mentor) return null;

  const selectedDateDisplay = formatLongDate(selectedDate);
  const selectedTimeDisplay = selectedSlot
    ? `${formatTime(selectedSlot.start)} - ${formatTime(selectedSlot.end)}`
    : 'Choose a slot';

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold font-mono text-white">Book Mock Interview</h1>
          <p className="text-gray-400 mt-2">Pick a date and time slot, then confirm your booking.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left: Mentor Details */}
        <div className="lg:w-1/3">
          <div className="bg-[#1a1d26] border border-[#2a2d3a] rounded-2xl p-8 sticky top-24">
            <div className="w-32 h-32 rounded-full bg-[#272b3a] mx-auto mb-6 flex items-center justify-center overflow-hidden">
              {mentor.avatar ? (
                <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-gray-400">
                  {mentor.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">{mentor.name}</h1>
            <p className="text-center text-[var(--color-primary)] font-medium mb-6">{mentor.title}</p>
            
            <div className="flex justify-center items-center gap-4 text-sm text-gray-400 mb-8">
              <div className="flex items-center gap-1">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold text-white">{mentor.stats.rating?.toFixed(1) || '5.0'}</span>
              </div>
              <span>•</span>
              <span>{mentor.stats.totalSessions} Sessions</span>
              <span>•</span>
              <span>{mentor.yearsOfExperience}y exp</span>
            </div>

            <div className="mb-6">
              <h3 className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wider">About</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{mentor.bio}</p>
            </div>

            <div>
              <h3 className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wider">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-[#272b3a] text-xs font-medium text-white">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="mt-8 pt-8 border-t border-[#2a2d3a]">
                <h3 className="text-gray-400 text-sm font-semibold mb-4 uppercase tracking-wider">Student Reviews</h3>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-[#111111] p-4 rounded-xl border border-[#2a2d3a]">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#272b3a] flex items-center justify-center overflow-hidden">
                          {review.studentAvatar ? (
                            <img src={review.studentAvatar} alt={review.studentName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-gray-400">
                              {review.studentName?.charAt(0).toUpperCase() || 'S'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{review.studentName || 'Anonymous Student'}</p>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs font-bold text-gray-300">{review.rating}</span>
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-gray-500">
                          {formatLongDate(review.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed italic">"{review.feedback}"</p>
                    </div>
                  ))}

                  {isLoadingMore && (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-[#2a2d3a] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
                    </div>
                  )}
                  {hasMore && !isLoadingMore && (
                    <div ref={lastReviewElementRef} className="h-4" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Booking Form */}
        <div className="lg:w-2/3">
          <div className="bg-[#111111] border border-[#2a2d3a] rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 font-mono text-[var(--color-primary)]">Book a Session</h2>
            
            {!availability || !availability.weeklyAvailability ? (
              <p className="text-gray-400">This mentor has not set up their availability yet.</p>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-4">1. Select a Date</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  {Array.from({ length: 7 }, (_, index) => {
                    const date = addDays(new Date(), index);
                    const dateValue = formatDateValue(date);
                    const isSelected = selectedDate === dateValue;
                    const weekday = WEEKDAY_NAMES[date.getDay()];
                    const hasSlots = (availability?.weeklyAvailability?.[weekday]?.length ?? 0) > 0;

                    return (
                      <button
                        key={dateValue}
                        onClick={() => {
                          setSelectedDate(dateValue);
                          setSelectedSlot(null);
                        }}
                        className={`relative p-3 rounded-xl border text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]'
                            : hasSlots
                            ? 'bg-[#1a1d26] border-[#2a2d3a] text-white hover:border-[var(--color-primary)]/50'
                            : 'bg-[#111111] border-[#1e1e1e] text-gray-600 cursor-pointer hover:border-gray-700'
                        }`}
                      >
                        <span className="block">{formatShortWeekday(date)}</span>
                        <span className="block text-xs mt-1 opacity-70">{formatShortDate(date)}</span>
                        {hasSlots && (
                          <span className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                            isSelected ? 'bg-[var(--color-primary)]' : 'bg-green-500'
                          }`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                <h3 className="text-lg font-semibold mb-4">2. Select a Time ({availability.timezone})</h3>
                {isLoadingSlots ? (
                  <div className="bg-[#1a1d26] border border-[#2a2d3a] rounded-xl p-6 text-gray-400 mb-10">
                    Loading available slots...
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="bg-[#1a1d26] border border-[#2a2d3a] rounded-xl p-6 text-gray-400 mb-10">
                    No slots available for this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot?.start === slot.start;
                      return (
                        <button
                          key={slot.start}
                          onClick={() => {
                            setSelectedSlot(slot);
                            setBookingAccessError('');
                          }}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-[0_0_15px_rgba(45,95,255,0.3)]'
                              : 'bg-[#1a1d26] border-[#2a2d3a] text-gray-300 hover:border-[var(--color-primary)]/50'
                          }`}
                        >
                          <span>{formatTime(slot.start)}</span>
                          <span className="text-xs opacity-70">{formatTime(slot.end)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="pt-6 border-t border-[#2a2d3a] grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
                  <div className="rounded-xl border border-[#2a2d3a] bg-[#161922] px-4 py-3">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Session Details</div>
                    <div className="text-sm text-gray-300">{selectedDateDisplay}</div>
                    <div className="text-sm font-semibold text-white">{selectedTimeDisplay}</div>
                    <div className="text-xs text-gray-500 mt-1">Access opens 5 minutes before the session starts.</div>
                  </div>

                  {isSubscriptionHydrated && hasMentorBookingAccess ? (
                    <button
                      onClick={handleBookSession}
                      disabled={!selectedSlot || isBooking}
                      className="px-8 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-colors"
                    >
                      {isBooking ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  ) : isSubscriptionHydrated ? (
                    <button
                      type="button"
                      onClick={() => navigate('/plans')}
                      className="px-8 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white font-bold transition-colors shadow-[0_0_18px_rgba(45,95,255,0.25)]"
                    >
                      Upgrade to Book
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="px-8 py-3 rounded-lg bg-[#272b3a] text-gray-500 font-bold cursor-wait"
                    >
                      Checking access...
                    </button>
                  )}
                </div>

                {isSubscriptionHydrated && !hasMentorBookingAccess && (
                  <div className="mt-5 rounded-xl border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <h3 className="font-bold text-white">Mentor sessions are included in Premium</h3>
                        </div>
                        <p className="text-sm text-gray-300 max-w-xl">
                          Review availability, choose a time, and upgrade when you are ready to confirm a 1-on-1 session.
                        </p>
                        {bookingAccessError && (
                          <p className="text-sm text-yellow-300 mt-3">{bookingAccessError}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/plans')}
                        className="h-11 px-5 rounded-lg bg-[var(--color-primary)] hover:bg-blue-600 text-white text-sm font-bold transition-colors whitespace-nowrap"
                      >
                        View Premium Plans
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default MentorProfilePage;
