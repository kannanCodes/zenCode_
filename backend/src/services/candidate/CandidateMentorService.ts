import { ICandidateMentorService } from "../../interfaces/service-interfaces/candidate/ICandidateMentorService";
import { MENTOR_DEFAULT_BIO, MENTOR_DEFAULT_TITLE, MENTOR_EXPERIENCE_MAPPING } from "../../constants/mentor.constants";
import { ICandidateMentorRepository } from "../../interfaces/repository-interfaces/candidate/ICandidateMentorRepository";
import { IMentorAvailabilityRepository } from "../../interfaces/repository-interfaces/mentor/IMentorAvailabilityRepository";
import { IMentorReviewRepository } from "../../interfaces/repository-interfaces/mentor/IMentorReviewRepository";
import { PublicMentorResponse } from "../../dtos/candidate/candidate-mentor.dto";
import type { ReviewResponse } from "../../dtos/mentor/mentor-review.dto";
import { IUser } from "../../infrastructure/database/models/user.model";
import { IMentorAvailability } from "../../infrastructure/database/models/mentor-availability.model";

export class CandidateMentorService implements ICandidateMentorService {
  constructor(
    private readonly candidateMentorRepository: ICandidateMentorRepository,
    private readonly mentorAvailabilityRepository: IMentorAvailabilityRepository,
    private readonly mentorReviewRepository: IMentorReviewRepository
  ) {}

  private async mapToPublicProfile(user: IUser, availability: IMentorAvailability | null): Promise<PublicMentorResponse> {
    let nextAvailableSlot: string | undefined;

    if (availability && availability.weeklyAvailability) {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
      for (const day of days) {
        const slots = availability.weeklyAvailability[day];
        if (slots && slots.length > 0) {
          nextAvailableSlot = `${day.charAt(0).toUpperCase() + day.slice(1)} at ${slots[0].startTime}`;
          break;
        }
      }
    }

    const mentorId = user.id || (user._id as unknown as { toString(): string })?.toString();
    const stats = await this.mentorReviewRepository.calculateMentorStats(mentorId);

    return {
      id: mentorId,
      name: user.fullName,
      avatar: user.avatarUrl,
      title: user.mentorTitle || (user.experienceLevel ? `${user.experienceLevel.charAt(0).toUpperCase() + user.experienceLevel.slice(1)} Engineer` : MENTOR_DEFAULT_TITLE),
      bio: user.mentorBio || MENTOR_DEFAULT_BIO,
      expertise: user.expertise || [],
      yearsOfExperience: user.experienceLevel ? MENTOR_EXPERIENCE_MAPPING[user.experienceLevel] || 1 : 1,
      availabilityPreview: {
        timezone: availability?.timezone || 'UTC',
        nextAvailableSlot,
      },
      stats: {
        totalSessions: stats.totalSessions,
        rating: stats.rating || undefined,
      },
    };
  }

  async getMentors(): Promise<PublicMentorResponse[]> {
    const users = await this.candidateMentorRepository.findActiveMentors();
    
    const mentors = await Promise.all(
      users.map(async (user) => {
        const mentorId = user.id || (user._id as unknown as { toString(): string })?.toString();
        const availability = await this.mentorAvailabilityRepository.findByMentorId(mentorId);
        return this.mapToPublicProfile(user, availability);
      })
    );

    return mentors;
  }

  async getMentorDetails(mentorId: string): Promise<PublicMentorResponse | null> {
    const user = await this.candidateMentorRepository.findActiveMentorById(mentorId);
    if (!user) return null;

    const availability = await this.mentorAvailabilityRepository.findByMentorId(mentorId);
    return this.mapToPublicProfile(user, availability);
  }

  async getMentorAvailability(mentorId: string): Promise<IMentorAvailability | null> {
    const user = await this.candidateMentorRepository.findActiveMentorById(mentorId);
    if (!user) return null;

    return this.mentorAvailabilityRepository.findByMentorId(mentorId);
  }

  async getMentorPublicReviews(mentorId: string): Promise<ReviewResponse[]> {
    return this.mentorReviewRepository.getMentorReviews(mentorId).then(reviews =>
      reviews.map(r => {
        const student = r.studentId as unknown as { fullName?: string; avatarUrl?: string };
        return {
          id: r._id as unknown as string,
          rating: r.rating,
          feedback: r.feedback,
          studentName: student?.fullName,
          studentAvatar: student?.avatarUrl,
          createdAt: r.createdAt.toISOString(),
        };
      })
    );
  }
}
