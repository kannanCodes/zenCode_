import { ICandidateMentorService } from "../../interfaces/service-interfaces/candidate/ICandidateMentorService";
import { MENTOR_DEFAULT_BIO, MENTOR_DEFAULT_TITLE, MENTOR_EXPERIENCE_MAPPING } from "../../constants/mentor.constants";
import { ICandidateMentorRepository } from "../../interfaces/repository-interfaces/candidate/ICandidateMentorRepository";
import { IMentorAvailabilityRepository } from "../../interfaces/repository-interfaces/mentor/IMentorAvailabilityRepository";
import { IMentorReviewRepository } from "../../interfaces/repository-interfaces/mentor/IMentorReviewRepository";
import {
  ListCandidateMentorsQuery,
  PaginatedPublicMentorsResponse,
  PublicMentorResponse,
} from "../../dtos/candidate/candidate-mentor.dto";
import type { ReviewResponse, PaginatedReviewsResponse } from "../../dtos/mentor/mentor-review.dto";
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
        totalSessions: user.totalReviews || 0, // Using total reviews as an indicator, or if we have another field for totalSessions we could use it
        rating: user.averageRating || undefined,
      },
    };
  }

  async getMentors(query: ListCandidateMentorsQuery): Promise<PaginatedPublicMentorsResponse> {
    const result = await this.candidateMentorRepository.findActiveMentors(query);
    
    const mentors = await Promise.all(
      result.data.map(async (user) => {
        const mentorId = user.id || (user._id as unknown as { toString(): string })?.toString();
        const availability = await this.mentorAvailabilityRepository.findByMentorId(mentorId);
        return this.mapToPublicProfile(user, availability);
      })
    );

    return {
      data: mentors,
      meta: result.meta,
    };
  }

  async getMentorSkills(): Promise<string[]> {
    const skills = await this.candidateMentorRepository.findActiveMentorSkills();
    return skills
      .filter((skill): skill is string => typeof skill === "string" && skill.trim().length > 0)
      .map((skill) => skill.trim())
      .sort((a, b) => a.localeCompare(b));
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

  async getMentorPublicReviews(mentorId: string, page: number, limit: number): Promise<PaginatedReviewsResponse> {
    const [reviews, total] = await this.mentorReviewRepository.getMentorReviews(mentorId, page, limit);

    const mappedReviews = reviews.map(r => {
      const student = r.studentId as unknown as { fullName?: string; avatarUrl?: string };
      return {
        id: r._id as unknown as string,
        rating: r.rating,
        feedback: r.feedback,
        studentName: student?.fullName,
        studentAvatar: student?.avatarUrl,
        createdAt: r.createdAt.toISOString(),
      };
    });

    return {
      data: mappedReviews,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
