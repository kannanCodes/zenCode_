import api from '../../../shared/lib/axios';

export interface ReviewPayload {
  bookingId: string;
  rating: number;
  feedback: string;
}

export interface ReviewResponse {
  id: string;
  rating: number;
  feedback: string;
  studentName?: string;
  studentAvatar?: string;
  createdAt: string;
}

export const mentorReviewApi = {
  submitReview: async (payload: ReviewPayload): Promise<void> => {
    await api.post('/mentor-reviews', payload);
  },

  getMentorReviews: async (mentorId: string): Promise<ReviewResponse[]> => {
    const res = await api.get(`/mentor-reviews/mentor/${mentorId}`);
    return res.data.data;
  },

  checkIfBookingReviewed: async (bookingId: string): Promise<boolean> => {
    const res = await api.get(`/mentor-reviews/booking/${bookingId}`);
    return res.data.data.hasReviewed;
  },
};
