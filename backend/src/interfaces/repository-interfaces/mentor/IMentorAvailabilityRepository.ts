import { IMentorAvailability } from "../../../infrastructure/database/models/mentor-availability.model";
import { UpsertAvailabilityInput } from "../../../dtos/mentor/upsert-availability.dto";

import { BaseRepository } from "../../../infrastructure/database/repositories/base/base.repository";

export interface IMentorAvailabilityRepository extends BaseRepository<IMentorAvailability> {
  upsertAvailability(mentorId: string, data: UpsertAvailabilityInput): Promise<IMentorAvailability | null>;
  findByMentorId(mentorId: string): Promise<IMentorAvailability | null>;
}
