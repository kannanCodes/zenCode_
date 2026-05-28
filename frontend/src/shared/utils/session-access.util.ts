import type { MentorBooking } from '../../features/mentor/types/booking';

const SESSION_JOIN_EARLY_MS = 5 * 60 * 1000;   // 5 min before start
const SESSION_GRACE_MS = 30 * 60 * 1000;        // 30 min after end

export const canJoinSession = (booking: Pick<MentorBooking, 'status' | 'startTime' | 'endTime'>): boolean => {
  if (booking.status !== 'confirmed') return false;
  const nowMs = Date.now();
  const startsAt = new Date(booking.startTime).getTime();
  const endsAt = new Date(booking.endTime).getTime();
  return nowMs >= startsAt - SESSION_JOIN_EARLY_MS && nowMs < endsAt + SESSION_GRACE_MS;
};

export const canCancelSession = (booking: Pick<MentorBooking, 'status' | 'startTime'>): boolean => {
  if (booking.status !== 'confirmed' && booking.status !== 'pending') return false;
  return Date.now() < new Date(booking.startTime).getTime();
};

export const isSessionExpired = (booking: Pick<MentorBooking, 'endTime'>): boolean => {
  return Date.now() >= new Date(booking.endTime).getTime() + SESSION_GRACE_MS;
};

export const getSessionHelperText = (booking: Pick<MentorBooking, 'status' | 'startTime' | 'endTime'>): string | null => {
  const nowMs = Date.now();
  const startsAt = new Date(booking.startTime).getTime();
  const endsAt = new Date(booking.endTime).getTime();
  const joinClosesAt = endsAt + SESSION_GRACE_MS;

  if (booking.status === 'pending') return 'Awaiting confirmation';
  if (booking.status !== 'confirmed') return null;

  if (nowMs < startsAt - SESSION_JOIN_EARLY_MS) return 'Available 5 mins before start';
  if (nowMs >= endsAt && nowMs < joinClosesAt) return 'Session ended · rejoin window active';
  if (nowMs >= joinClosesAt) return 'Session window closed';
  return null;
};
