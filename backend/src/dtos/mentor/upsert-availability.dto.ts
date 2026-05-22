export interface TimeSlotInput {
  startTime: string;
  endTime: string;
}

export interface WeeklyAvailabilityInput {
  monday?: TimeSlotInput[];
  tuesday?: TimeSlotInput[];
  wednesday?: TimeSlotInput[];
  thursday?: TimeSlotInput[];
  friday?: TimeSlotInput[];
  saturday?: TimeSlotInput[];
  sunday?: TimeSlotInput[];
}

export interface UpsertAvailabilityInput {
  timezone: string;
  weeklyAvailability: WeeklyAvailabilityInput;
}
