export interface CreateReviewInput {
  bookingId: string;
  rating: number;
  feedback: string;
  isPublic?: boolean;
}

export interface ReviewResponse {
  id: string;
  rating: number;
  feedback: string;
  studentName?: string;
  studentAvatar?: string;
  createdAt: string;
}
