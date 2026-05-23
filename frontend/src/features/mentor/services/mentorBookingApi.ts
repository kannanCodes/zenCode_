import api from '../../../shared/lib/axios';
import type { MentorBooking, MentorSession } from '../types/booking';

export const mentorBookingApi = {
  getMentorBookings: async (): Promise<{ data: MentorBooking[] }> => {
    const response = await api.get('/mentor-bookings/mentor');
    return response.data;
  },

  createSession: async (bookingId: string): Promise<{ data: MentorSession }> => {
    const response = await api.post('/mentor-sessions', {
      bookingId,
    });
    return response.data;
  },

  cancelBooking: async (bookingId: string): Promise<{ data: MentorBooking }> => {
    const response = await api.patch(`/mentor-bookings/${bookingId}/cancel`);
    return response.data;
  },

  validateSession: async (roomId: string): Promise<{ data: MentorSession }> => {
    const response = await api.get(`/mentor-sessions/${roomId}/validate`);
    return response.data;
  }
};
