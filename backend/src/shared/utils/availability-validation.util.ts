import { AppError } from "../utils/AppError";
import { STATUS_CODES } from "../constants/status";
import { AVAILABILITY_MESSAGES } from "../../constants/messages";
import { Slot } from "../types/mentor-availability.types";

const convertToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const validateAndNormalizeAvailability = (
  availability: Record<string, Slot[]>
): Record<string, Slot[]> => {
  for (const day of Object.keys(availability)) {
    const slots = availability[day] || [];

    // sort slots
    slots.sort((a, b) => convertToMinutes(a.startTime) - convertToMinutes(b.startTime));

    for (let i = 0; i < slots.length; i++) {
      const current = slots[i];
      const start = convertToMinutes(current.startTime);
      const end = convertToMinutes(current.endTime);

      // start < end
      if (start >= end) {
        throw new AppError(
          `${day}: ${AVAILABILITY_MESSAGES.START_LESS_THAN_END}`,
          STATUS_CODES.BAD_REQUEST
        );
      }

      // overlap detection
      if (i > 0) {
        const previous = slots[i - 1];
        const previousEnd = convertToMinutes(previous.endTime);

        if (start < previousEnd) {
          throw new AppError(
            `${day}: ${AVAILABILITY_MESSAGES.OVERLAPPING_SLOTS}`,
            STATUS_CODES.BAD_REQUEST
          );
        }
      }
    }
  }

  return availability;
};
