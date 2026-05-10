import { Server } from './server/server';
import { registerGracefulShutdown } from './server/graceful-shutdown';

const start = async () => {
  const server = new Server();
  await server.start();
  registerGracefulShutdown(server);
};

start();