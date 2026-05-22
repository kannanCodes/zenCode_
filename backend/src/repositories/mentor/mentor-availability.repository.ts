import MentorAvailabilityModel, { IMentorAvailability } from "../../infrastructure/database/models/mentor-availability.model";
import { IMentorAvailabilityRepository } from "../../interfaces/repository-interfaces/mentor/IMentorAvailabilityRepository";
import { UpsertAvailabilityInput } from "../../dtos/mentor/upsert-availability.dto";
import { BaseRepository } from "../../infrastructure/database/repositories/base/base.repository";

export class MentorAvailabilityRepository extends BaseRepository<IMentorAvailability> implements IMentorAvailabilityRepository {
  constructor() {
    super(MentorAvailabilityModel);
  }

  async upsertAvailability(mentorId: string, data: UpsertAvailabilityInput): Promise<IMentorAvailability | null> {
    return this.model.findOneAndUpdate(
      { mentorId },
      {
        mentorId,
        ...data,
      },
      {
        new: true,
        upsert: true,
      }
    ).exec();
  }

  async findByMentorId(mentorId: string): Promise<IMentorAvailability | null> {
    return this.findOne({ mentorId });
  }
}
