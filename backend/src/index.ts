import { Server } from './server/server';
import { registerGracefulShutdown } from './server/graceful-shutdown';
import { logger } from './shared/utils/Logger';

const startApplication = async () => {
  try {
    const serverInstance = new Server();
    const httpServer = await serverInstance.start();

    registerGracefulShutdown(httpServer);
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
};

startApplication();