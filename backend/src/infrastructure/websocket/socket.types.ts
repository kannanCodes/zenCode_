import { Socket } from 'socket.io';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    role: string;
  };
  currentRoomId?: string;
}

export interface SocketJwtPayload extends JwtPayload {
  id: string;
  role: string;
}

export interface IRtcSessionDescriptionInit {
  type: 'offer' | 'pranswer' | 'answer' | 'rollback';
  sdp?: string;
}

export interface IRtcIceCandidateInit {
  candidate?: string;
  sdpMLineIndex?: number | null;
  sdpMid?: string | null;
  usernameFragment?: string | null;
}

export interface WebRTCOfferPayload {
  roomId: string;
  targetUserId: string;
  offer: IRtcSessionDescriptionInit;
}

export interface WebRTCAnswerPayload {
  roomId: string;
  targetUserId: string;
  answer: IRtcSessionDescriptionInit;
}

export interface ICECandidatePayload {
  roomId: string;
  targetUserId: string;
  candidate: IRtcIceCandidateInit;
}

export interface MediaStatePayload {
  roomId: string;
  micEnabled?: boolean;
  cameraEnabled?: boolean;
  screenSharing?: boolean;
}
