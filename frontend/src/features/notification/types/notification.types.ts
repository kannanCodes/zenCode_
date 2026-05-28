export type NotificationType =
  | 'mentor_session_booked'
  | 'mentor_session_reminder'
  | 'mentor_session_started'
  | 'mentor_session_cancelled';

export interface NotificationData {
  bookingId?: string;
  sessionId?: string;
  mentorId?: string;
  candidateId?: string;
  startTime?: string;
  endTime?: string;
}

export interface INotification {
  _id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSocketPayload {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  isRead: boolean;
  createdAt: string;
}
