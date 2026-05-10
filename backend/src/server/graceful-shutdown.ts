import mongoose from 'mongoose';
import { Server } from './server';
import { redisClient } from '../infrastructure/cache/redis';
import { logger } from "../shared/utils/Logger";

export const registerGracefulShutdown = (server: Server) => {
  const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully...`);

    const httpServer = server.getHttpServer();

    const shutdownProcess = async () => {
      try {
        if (redisClient.status === 'ready') {
          await redisClient.quit();
          logger.info('Redis disconnected');
        }
        await mongoose.disconnect();
        logger.info('MongoDB disconnected');
        logger.info('Graceful shutdown complete');
        process.exit(0);
      } catch (err) {
        logger.error('Error during shutdown', err);
        process.exit(1);
      }
    };

    if (httpServer) {
      httpServer.close(async () => {
        logger.info('HTTP server closed');
        await shutdownProcess();
      });
    } else {
      await shutdownProcess();
    }
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};
