import api from '../../../shared/lib/axios';

export interface CreateBookingPayload {
  mentorId: string;
  startTime: string;
  endTime: string;
  paymentMethodId?: string;
  amount?: number;
}

export interface MentorSlot {
  start: string;
  end: string;
}

export const candidateBookingApi = {
  createBooking: async (payload: CreateBookingPayload) => {
    // Re-uses the unified backend endpoint for booking creation for now
    const response = await api.post('/mentor-bookings', payload);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get('/mentor-bookings/my');
    return response.data;
  },

  getMentorSlots: async (mentorId: string, date: string): Promise<{ data: MentorSlot[] }> => {
    const response = await api.get(`/mentor-slots/${mentorId}`, {
      params: { date },
    });
    return response.data;
  },

  cancelBooking: async (bookingId: string) => {
    const response = await api.patch(`/mentor-bookings/${bookingId}/cancel`);
    return response.data;
  },
};
