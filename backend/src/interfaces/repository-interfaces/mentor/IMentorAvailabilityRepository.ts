import { IMentorAvailability } from "../../../infrastructure/database/models/mentor-availability.model";
import { UpsertAvailabilityInput } from "../../../dtos/mentor/upsert-availability.dto";

export interface IMentorAvailabilityRepository {
  upsertAvailability(mentorId: string, data: UpsertAvailabilityInput): Promise<IMentorAvailability | null>;
  findByMentorId(mentorId: string): Promise<IMentorAvailability | null>;
}
