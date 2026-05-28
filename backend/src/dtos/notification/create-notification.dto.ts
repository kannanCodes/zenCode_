import { NotificationType } from '../../constants/notification-type';


export interface NotificationData {
  bookingId?: string;
  sessionId?: string;
  mentorId?: string;
  candidateId?: string;
  startTime?: string;
  endTime?: string;
}


export interface CreateNotificationDto {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;

  dedupeKey?: string;

  recipientEmail?: string;
  recipientName?: string;
  mentorName?: string;
  candidateName?: string;
  sessionStartTime?: Date;
  sessionEndTime?: Date;
}
