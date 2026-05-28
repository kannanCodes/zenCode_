import { Server } from 'socket.io';
import http from 'http';
import { socketAuthMiddleware } from './socket-auth.middleware';
import { registerSessionSocket } from './session.socket';
import { appConfig } from '../../config/appConfig';

let _io: Server | null = null;


export const getIo = (): Server => {
  if (!_io) {
    throw new Error('Socket.IO server has not been initialized yet.');
  }
  return _io;
};

export const initializeSocketServer = (server: http.Server): Server => {
  const io = new Server(server, {
    cors: {
      origin: appConfig.frontendUrl,
      credentials: true,
    },
  });

  _io = io;

  io.use(socketAuthMiddleware);

  registerSessionSocket(io);

  return io;
};
