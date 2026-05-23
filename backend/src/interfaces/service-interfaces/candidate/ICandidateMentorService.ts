import { PublicMentorResponse } from "../../../dtos/candidate/candidate-mentor.dto";
import { IMentorAvailability } from "../../../infrastructure/database/models/mentor-availability.model";
import type { ReviewResponse } from "../../../dtos/mentor/mentor-review.dto";

export interface ICandidateMentorService {
  getMentors(): Promise<PublicMentorResponse[]>;
  getMentorDetails(mentorId: string): Promise<PublicMentorResponse | null>;
  getMentorAvailability(mentorId: string): Promise<IMentorAvailability | null>;
  getMentorPublicReviews(mentorId: string): Promise<ReviewResponse[]>;
}
