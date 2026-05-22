import { IMentorAvailability } from "../../../infrastructure/database/models/mentor-availability.model";
import { UpsertAvailabilityInput } from "../../../dtos/mentor/upsert-availability.dto";

export interface IMentorAvailabilityService {
  upsertAvailability(mentorId: string, data: UpsertAvailabilityInput): Promise<IMentorAvailability | null>;
  getMyAvailability(mentorId: string): Promise<IMentorAvailability | null>;
  getMentorAvailability(mentorId: string): Promise<IMentorAvailability | null>;
}
