import { Server } from 'socket.io';
import http from 'http';
import { socketAuthMiddleware } from './socket-auth.middleware';
import { registerSessionSocket } from './session.socket';
import { appConfig } from '../../config/appConfig';

export const initializeSocketServer = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: appConfig.frontendUrl,
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  registerSessionSocket(io);

  return io;
};
