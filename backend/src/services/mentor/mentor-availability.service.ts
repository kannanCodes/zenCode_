import { IMentorAvailabilityService } from "../../interfaces/service-interfaces/mentor/IMentorAvailabilityService";
import { IMentorAvailabilityRepository } from "../../interfaces/repository-interfaces/mentor/IMentorAvailabilityRepository";
import { UpsertAvailabilityInput } from "../../dtos/mentor/upsert-availability.dto";
import { validateAndNormalizeAvailability } from "../../shared/utils/availability-validation.util";
import { IMentorAvailability } from "../../infrastructure/database/models/mentor-availability.model";
import { Slot } from "../../shared/types/mentor-availability.types";

export class MentorAvailabilityService implements IMentorAvailabilityService {
  constructor(private readonly availabilityRepo: IMentorAvailabilityRepository) {}

  async upsertAvailability(mentorId: string, data: UpsertAvailabilityInput): Promise<IMentorAvailability | null> {
    const normalizedAvailability = validateAndNormalizeAvailability(
      data.weeklyAvailability as unknown as Record<string, Slot[]>
    );

    return this.availabilityRepo.upsertAvailability(mentorId, {
      ...data,
      weeklyAvailability: normalizedAvailability as UpsertAvailabilityInput["weeklyAvailability"],
    });
  }

  async getMyAvailability(mentorId: string): Promise<IMentorAvailability | null> {
    return this.availabilityRepo.findByMentorId(mentorId);
  }

  async getMentorAvailability(mentorId: string): Promise<IMentorAvailability | null> {
    return this.availabilityRepo.findByMentorId(mentorId);
  }
}
