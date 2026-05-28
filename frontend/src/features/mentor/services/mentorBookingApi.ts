import api from '../../../shared/lib/axios';
import type { MentorBooking, MentorSession, MentorDashboardStats, DashboardUpcomingSession } from '../types/booking';

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
  },

  getDashboardStats: async (): Promise<{ data: MentorDashboardStats }> => {
    const response = await api.get('/mentor-bookings/stats');
    return response.data;
  },

  getUpcomingBookings: async (limit = 10): Promise<{ data: DashboardUpcomingSession[] }> => {
    const response = await api.get(`/mentor-bookings/upcoming?limit=${limit}`);
    return response.data;
  },
};
