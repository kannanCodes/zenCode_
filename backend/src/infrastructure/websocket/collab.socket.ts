import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.types';
import { COLLAB_EVENTS } from './socket.events';
import { collaborationStore } from './collab.store';

export const registerCollabSockets = (io: Server, socket: AuthenticatedSocket) => {
  socket.on(COLLAB_EVENTS.CODE_CHANGED, async (payload) => {
    const { roomId, code, language, version } = payload;

    const existing = collaborationStore.get(roomId);

    if (existing && version < existing.version) {
      return;
    }

    collaborationStore.set(roomId, {
      code,
      language,
      version,
    });

    socket.to(roomId).emit(COLLAB_EVENTS.CODE_SYNC, {
      code,
      language,
      version,
    });
  });

  socket.on(COLLAB_EVENTS.LANGUAGE_CHANGED, (payload) => {
    const { roomId, language } = payload;
    socket.to(roomId).emit(COLLAB_EVENTS.LANGUAGE_CHANGED, { language });
  });
};
