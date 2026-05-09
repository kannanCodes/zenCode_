import { Server as HttpServer } from 'http';
import mongoose from 'mongoose';
import { redisClient } from '../infrastructure/cache/redis';
import { logger } from '../shared/utils/Logger';

export const registerGracefulShutdown = (server: HttpServer) => {
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully...`);

    server.close(async () => {
      logger.info('HTTP server closed');

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
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};
