
export interface BookingConfirmationEmailData {
  to: string;
  recipientName: string;
  mentorName: string;
  candidateName: string;
  startTime: Date;
  endTime: Date;
  bookingId: string;
}


export interface BookingCancelledEmailData {
  to: string;
  recipientName: string;
  mentorName: string;
  candidateName: string;
  startTime: Date;
  endTime: Date;
  bookingId: string;
  cancelledByName: string;
}
