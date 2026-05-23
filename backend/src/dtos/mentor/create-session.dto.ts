export interface CreateMentorSessionInput {
  bookingId: string;
  mentorId?: string;
  studentId?: string;
  scheduledStart?: Date | string;
  scheduledEnd?: Date | string;
}
