import type { WeeklyAvailability } from '../types/availability';

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
type DayOfWeek = typeof daysOfWeek[number];

/**
 * Normalizes time "HH:MM" by applying an offset in minutes.
 * It shifts the day if the time crosses midnight.
 * Returns the new day and time.
 */
function shiftTimeAndDay(day: DayOfWeek, time: string, offsetMinutes: number): { day: DayOfWeek; time: string } {
  const [hours, minutes] = time.split(':').map(Number);
  let totalMinutes = hours * 60 + minutes + offsetMinutes;

  let dayIndex = daysOfWeek.indexOf(day);

  while (totalMinutes < 0) {
    totalMinutes += 24 * 60;
    dayIndex = (dayIndex - 1 + 7) % 7;
  }

  while (totalMinutes >= 24 * 60) {
    totalMinutes -= 24 * 60;
    dayIndex = (dayIndex + 1) % 7;
  }

  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;

  const newTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  
  return { day: daysOfWeek[dayIndex], time: newTime };
}

/**
 * Gets the timezone offset in minutes between the local browser timezone and UTC.
 * Positive means local is ahead of UTC (e.g. IST is +330).
 * Note: standard JS getTimezoneOffset() returns opposite (e.g. -330 for IST).
 * We will use a date-based approach to get the correct absolute offset for a generic date.
 */
function getLocalUtcOffsetMinutes(): number {
  return -new Date().getTimezoneOffset();
}

export function utcToLocalWeekly(utcWeekly: WeeklyAvailability): WeeklyAvailability {
  const offset = getLocalUtcOffsetMinutes();
  return shiftWeeklyAvailability(utcWeekly, offset);
}

export function localToUtcWeekly(localWeekly: WeeklyAvailability): WeeklyAvailability {
  const offset = getLocalUtcOffsetMinutes();
  return shiftWeeklyAvailability(localWeekly, -offset);
}

function shiftWeeklyAvailability(weekly: WeeklyAvailability, offsetMinutes: number): WeeklyAvailability {
  const shiftedWeekly: WeeklyAvailability = {};
  
  // Initialize empty arrays
  daysOfWeek.forEach(d => shiftedWeekly[d] = []);

  daysOfWeek.forEach(day => {
    const slots = weekly[day];
    if (!slots) return;

    slots.forEach(slot => {
      const shiftedStart = shiftTimeAndDay(day, slot.startTime, offsetMinutes);
      const shiftedEnd = shiftTimeAndDay(day, slot.endTime, offsetMinutes);

      // If a slot crosses midnight after shifting, it needs to be split into two slots 
      // (one ending at 23:59, another starting at 00:00).
      // For simplicity, we assume the backend handles start > end or we split it here.
      if (shiftedStart.day === shiftedEnd.day && shiftedStart.time < shiftedEnd.time) {
        shiftedWeekly[shiftedStart.day]!.push({
          startTime: shiftedStart.time,
          endTime: shiftedEnd.time
        });
      } else {
        // Slot crossed midnight boundary (e.g. 23:00 to 01:00)
        shiftedWeekly[shiftedStart.day]!.push({
          startTime: shiftedStart.time,
          endTime: "23:59"
        });
        shiftedWeekly[shiftedEnd.day]!.push({
          startTime: "00:00",
          endTime: shiftedEnd.time
        });
      }
    });
  });

  // Clean up empty arrays
  daysOfWeek.forEach(d => {
    if (shiftedWeekly[d]?.length === 0) {
      delete shiftedWeekly[d];
    }
  });

  return shiftedWeekly;
}

export function getCurrentTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
