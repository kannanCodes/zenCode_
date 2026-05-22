export interface IMentorSlotService {
  getMentorSlots(mentorId: string, startDate: string, endDate: string): Promise<{ start: string; end: string }[]>;
}
