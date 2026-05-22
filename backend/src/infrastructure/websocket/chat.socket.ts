import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.types';
import { CHAT_EVENTS } from './socket.events';
import { messageService } from '../../shared/di/chat.container';
import { logger } from '../../shared/utils/Logger';
import { Types } from 'mongoose';

export const registerChatSockets = (io: Server, socket: AuthenticatedSocket) => {
  if (!socket.user) return;
  const userId = socket.user.id;

  socket.on(CHAT_EVENTS.SEND_MESSAGE, async (payload) => {
    try {
      const { roomId, content } = payload;

      const message = await messageService.createMessage({
        roomId,
        senderId: new Types.ObjectId(userId),
        content,
      });

      io.to(roomId).emit(CHAT_EVENTS.NEW_MESSAGE, message);
    } catch (error: unknown) {
      logger.error('Chat error:', error);
    }
  });

  socket.on(CHAT_EVENTS.TYPING_START, ({ roomId }) => {
    socket.to(roomId).emit(CHAT_EVENTS.TYPING_START, { userId });
  });

  socket.on(CHAT_EVENTS.TYPING_STOP, ({ roomId }) => {
    socket.to(roomId).emit(CHAT_EVENTS.TYPING_STOP, { userId });
  });

  socket.on(CHAT_EVENTS.MESSAGE_READ, ({ roomId }) => {
    socket.to(roomId).emit(CHAT_EVENTS.MESSAGE_READ, { userId });
  });
};
