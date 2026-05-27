import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.types';
import { COLLAB_EVENTS } from './socket.events';
import { collaborationStore } from './collab.store';
import { mentorSessionService } from '../../shared/di/mentor.container';

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

    if (socket.user?.id) {
      await mentorSessionService.updateWorkspaceCode(roomId, socket.user.id, {
        code,
        language,
        version,
      });
    }

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

  socket.on(COLLAB_EVENTS.RUN_RESULT, async (payload) => {
    const { roomId, result, error } = payload;
    if (socket.user?.id) {
      await mentorSessionService.updateWorkspaceRunResult(roomId, socket.user.id, { result, error });
    }

    socket.to(roomId).emit(COLLAB_EVENTS.RUN_RESULT, {
      result,
      error,
      userId: socket.user?.id,
    });
  });

  socket.on(COLLAB_EVENTS.PROBLEM_CHANGED, (payload) => {
    const { roomId, workspace } = payload;
    if (workspace?.editorState) {
      collaborationStore.set(roomId, workspace.editorState);
    }
    socket.to(roomId).emit(COLLAB_EVENTS.PROBLEM_CHANGED, { workspace, userId: socket.user?.id });
  });
};
