export interface CreateMentorSessionInput {
  bookingId: string;
  mentorId: string;
  studentId: string;
  scheduledStart: Date;
  scheduledEnd: Date;
}
