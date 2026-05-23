import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { AuthenticatedSocket, SocketJwtPayload } from './socket.types';
import { AUTH_MESSAGES } from '../../constants/messages';
import { appConfig } from '../../config/appConfig';

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error(AUTH_MESSAGES.UNAUTHORIZED));
    }

    const decoded = jwt.verify(
      token,
      appConfig.jwt.accessSecret
    ) as SocketJwtPayload;

    const userId = decoded.sub || decoded.id;
    if (!userId) {
      return next(new Error(AUTH_MESSAGES.UNAUTHORIZED));
    }

    (socket as AuthenticatedSocket).user = {
      id: userId,
      role: decoded.role,
    };

    next();
  } catch {
    next(new Error(AUTH_MESSAGES.UNAUTHORIZED));
  }
};
