export interface TimeSlot {
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:00"
}

export interface WeeklyAvailability {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
}

export interface MentorAvailability {
  _id: string;
  mentorId: string;
  timezone: string;
  weeklyAvailability: WeeklyAvailability;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertAvailabilityPayload {
  timezone: string;
  weeklyAvailability: WeeklyAvailability;
}
