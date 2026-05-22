import { IMentorSlotService } from "../../interfaces/service-interfaces/mentor/IMentorSlotService";
import { IMentorAvailabilityRepository } from "../../interfaces/repository-interfaces/mentor/IMentorAvailabilityRepository";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import { AVAILABILITY_MESSAGES } from "../../constants/messages";
import { generateSlots } from "../../shared/utils/slot-generation.util";
import { IMentorAvailability } from "../../infrastructure/database/models/mentor-availability.model";

export class MentorSlotService implements IMentorSlotService {
  constructor(private readonly availabilityRepo: IMentorAvailabilityRepository) {}

  async getMentorSlots(mentorId: string, startDate: string, endDate: string) {
    const availability = await this.availabilityRepo.findByMentorId(mentorId);

    if (!availability) {
      throw new AppError(AVAILABILITY_MESSAGES.NOT_CONFIGURED, STATUS_CODES.NOT_FOUND);
    }

    // Weekly availability has to be cast to match the GenerateSlotsInput type signature safely
    const weeklyAvailability = availability.weeklyAvailability as unknown as Record<string, { startTime: string; endTime: string }[]>;

    const slots = generateSlots({
      timezone: availability.timezone,
      weeklyAvailability,
      startDate,
      endDate,
    });

    return slots;
  }
}
