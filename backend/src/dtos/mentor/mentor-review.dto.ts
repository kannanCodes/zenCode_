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

export interface ListReviewsQuery {
  page: number;
  limit: number;
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
