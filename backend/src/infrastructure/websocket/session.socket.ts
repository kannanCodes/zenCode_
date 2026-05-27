import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket.types';
import { SESSION_EVENTS } from './socket.events';
import { presenceStore } from './presence.store';
import { mentorSessionService } from '../../shared/di/mentor.container';
import { registerChatSockets } from './chat.socket';
import { registerCollabSockets } from './collab.socket';
import { collaborationStore } from './collab.store';
import { logger } from '../../shared/utils/Logger';
import { GLOBAL_MESSAGES } from '../../constants/messages';

const getOnlineParticipants = (session: {
  mentorId: { toString(): string };
  studentId: { toString(): string };
  mentorOnline?: boolean;
  studentOnline?: boolean;
}) => [
  ...(session.mentorOnline ? [session.mentorId.toString()] : []),
  ...(session.studentOnline ? [session.studentId.toString()] : []),
];

export const registerSessionSocket = (io: Server) => {
  io.on('connection', (socket: AuthenticatedSocket) => {
    if (!socket.user) {
      return;
    }

    const userId = socket.user.id;

    presenceStore.add(userId, socket.id);
    logger.info(`Socket connected: ${socket.id}`);

    // Register modular feature sockets
    registerChatSockets(io, socket);
    registerCollabSockets(io, socket);

    /*
      JOIN SESSION
    */
    socket.on(SESSION_EVENTS.JOIN_SESSION, async ({ roomId }) => {
      try {
        const session = await mentorSessionService.validateSessionAccess(roomId, userId);

        socket.join(roomId);
        socket.currentRoomId = roomId;

        await mentorSessionService.handleReconnect(roomId, userId);
        const updatedSession = await mentorSessionService.markParticipantOnline(roomId, userId);
        const activeSession = updatedSession || session;

        socket.to(roomId).emit(SESSION_EVENTS.USER_JOINED, {
          userId,
        });

        io.to(roomId).emit(SESSION_EVENTS.PARTICIPANT_ONLINE, {
          userId,
        });

        const workspace = await mentorSessionService.getWorkspace(roomId, userId);
        const editorState = collaborationStore.get(roomId) || workspace.editorState;

        socket.emit(SESSION_EVENTS.SESSION_JOINED_SUCCESS, {
          roomId,
          sessionId: session._id,
          participants: getOnlineParticipants(activeSession),
          editorState: editorState || null,
        });
      } catch (error: unknown) {
        socket.emit(SESSION_EVENTS.SESSION_ERROR, {
          message: error instanceof Error ? error.message : GLOBAL_MESSAGES.UNKNOWN_ERROR_OCCURRED,
        });
      }
    });

    /*
      LEAVE SESSION
    */
    socket.on(SESSION_EVENTS.LEAVE_SESSION, async () => {
      const roomId = socket.currentRoomId;

      if (!roomId) {
        return;
      }

      socket.leave(roomId);

      await mentorSessionService.markParticipantOffline(roomId, userId);

      socket.to(roomId).emit(SESSION_EVENTS.USER_LEFT, {
        userId,
      });

      socket.currentRoomId = undefined;
    });

    /*
      DISCONNECT
    */
    socket.on('disconnect', async () => {
      presenceStore.remove(userId, socket.id);

      const roomId = socket.currentRoomId;

      if (roomId) {
        const stillOnline = presenceStore.isOnline(userId);

        if (!stillOnline) {
          await mentorSessionService.markParticipantOffline(roomId, userId);

          io.to(roomId).emit(SESSION_EVENTS.PARTICIPANT_OFFLINE, {
            userId,
          });
        }
      }

      await mentorSessionService.handleDisconnect(userId);

      logger.info(`Socket disconnected: ${socket.id}`);
    });

    /*
      HEARTBEAT
    */
    socket.on(SESSION_EVENTS.HEARTBEAT, async ({ roomId }) => {
      await mentorSessionService.updateHeartbeat(roomId, userId);
    });

    /*
      WEBRTC RELAY: OFFER
    */
    socket.on(SESSION_EVENTS.WEBRTC_OFFER, async (payload) => {
      try {
        const { targetUserId, offer, roomId } = payload;
        await mentorSessionService.validatePeerAccess(roomId, userId, targetUserId);

        const targetSockets = presenceStore.getUserSockets(targetUserId);
        targetSockets.forEach(socketId => {
          io.to(socketId).emit(SESSION_EVENTS.WEBRTC_OFFER, {
            fromUserId: userId,
            roomId,
            offer,
          });
        });
      } catch (error: unknown) {
        socket.emit(SESSION_EVENTS.SESSION_ERROR, {
          message: error instanceof Error ? error.message : GLOBAL_MESSAGES.UNKNOWN_ERROR_OCCURRED,
        });
      }
    });

    /*
      WEBRTC RELAY: ANSWER
    */
    socket.on(SESSION_EVENTS.WEBRTC_ANSWER, async (payload) => {
      try {
        const { targetUserId, answer, roomId } = payload;
        await mentorSessionService.validatePeerAccess(roomId, userId, targetUserId);

        const targetSockets = presenceStore.getUserSockets(targetUserId);
        targetSockets.forEach(socketId => {
          io.to(socketId).emit(SESSION_EVENTS.WEBRTC_ANSWER, {
            fromUserId: userId,
            roomId,
            answer,
          });
        });
      } catch (error: unknown) {
        socket.emit(SESSION_EVENTS.SESSION_ERROR, {
          message: error instanceof Error ? error.message : GLOBAL_MESSAGES.UNKNOWN_ERROR_OCCURRED,
        });
      }
    });

    /*
      WEBRTC RELAY: ICE CANDIDATES
    */
    socket.on(SESSION_EVENTS.WEBRTC_ICE_CANDIDATE, async (payload) => {
      try {
        const { targetUserId, candidate, roomId } = payload;
        await mentorSessionService.validatePeerAccess(roomId, userId, targetUserId);

        const targetSockets = presenceStore.getUserSockets(targetUserId);
        targetSockets.forEach(socketId => {
          io.to(socketId).emit(SESSION_EVENTS.WEBRTC_ICE_CANDIDATE, {
            fromUserId: userId,
            roomId,
            candidate,
          });
        });
      } catch (error: unknown) {
        socket.emit(SESSION_EVENTS.SESSION_ERROR, {
          message: error instanceof Error ? error.message : GLOBAL_MESSAGES.UNKNOWN_ERROR_OCCURRED,
        });
      }
    });

    /*
      MEDIA STATE SYNC
    */
    socket.on(SESSION_EVENTS.MEDIA_STATE_CHANGED, async (payload) => {
      socket.to(payload.roomId).emit(SESSION_EVENTS.MEDIA_STATE_CHANGED, {
        userId,
        ...payload,
      });
    });

    /*
      SCREEN SHARE EVENTS
    */
    socket.on(SESSION_EVENTS.SCREEN_SHARE_STARTED, ({ roomId }) => {
      socket.to(roomId).emit(SESSION_EVENTS.SCREEN_SHARE_STARTED, { userId });
    });

    socket.on(SESSION_EVENTS.SCREEN_SHARE_STOPPED, ({ roomId }) => {
      socket.to(roomId).emit(SESSION_EVENTS.SCREEN_SHARE_STOPPED, { userId });
    });
  });
};
