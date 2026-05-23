import { addDays, addMinutes, isAfter, isBefore, startOfDay } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { WEEKDAY_MAP, convertTimeToMinutes } from './date.util';
import { SLOT_DURATION_MINUTES } from '../../constants/booking.constants';

interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface GenerateSlotsInput {
  timezone: string;
  weeklyAvailability: Record<string, TimeSlot[]>;
  startDate: string;
  endDate: string;
}

export const generateSlots = ({
  timezone,
  weeklyAvailability,
  startDate,
  endDate,
}: GenerateSlotsInput) => {
  const slots: { start: string; end: string }[] = [];
  let currentDate = startOfDay(new Date(startDate));
  const finalDate = startOfDay(new Date(endDate));

  while (isBefore(currentDate, addDays(finalDate, 1))) {
    const weekday = WEEKDAY_MAP[currentDate.getDay()];
    const dayAvailability = weeklyAvailability[weekday] || [];

    for (const availabilitySlot of dayAvailability) {
      const startMinutes = convertTimeToMinutes(availabilitySlot.startTime);
      const endMinutes =
        availabilitySlot.endTime === '23:59'
          ? 24 * 60
          : convertTimeToMinutes(availabilitySlot.endTime);
      let currentSlotStart = startMinutes;

      while (currentSlotStart + SLOT_DURATION_MINUTES <= endMinutes) {
        const slotStartDate = new Date(currentDate);
        slotStartDate.setHours(0, 0, 0, 0);
        slotStartDate.setMinutes(currentSlotStart);

        const slotEndDate = addMinutes(slotStartDate, SLOT_DURATION_MINUTES);

        // convert mentor local timezone → UTC
        const utcSlotStart = fromZonedTime(slotStartDate, timezone);
        const utcSlotEnd = fromZonedTime(slotEndDate, timezone);

        // filter past slots
        if (isAfter(utcSlotStart, new Date())) {
          slots.push({
            start: utcSlotStart.toISOString(),
            end: utcSlotEnd.toISOString(),
          });
        }

        currentSlotStart += SLOT_DURATION_MINUTES;
      }
    }
    currentDate = addDays(currentDate, 1);
  }

  return slots;
};
