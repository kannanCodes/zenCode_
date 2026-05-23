
export interface ChatMessage {
  _id: string;
  roomId: string;
  senderId: { _id: string; fullName?: string; avatarUrl?: string };
  content: string;
  readBy: string[];
  createdAt: string;
}
