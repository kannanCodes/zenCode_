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

export interface PaginatedReviewsResponse {
  data: ReviewResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const mentorReviewApi = {
  submitReview: async (payload: ReviewPayload): Promise<void> => {
    await api.post('/mentor-reviews', payload, { suppressGlobalErrorToast: true });
  },

  getMentorReviews: async (mentorId: string, page = 1, limit = 5): Promise<PaginatedReviewsResponse> => {
    const res = await api.get(`/mentor-reviews/mentor/${mentorId}?page=${page}&limit=${limit}`);
    return res.data.data;
  },

  checkIfBookingReviewed: async (bookingId: string): Promise<boolean> => {
    const res = await api.get(`/mentor-reviews/booking/${bookingId}`);
    return res.data.data.hasReviewed;
  },
};
