import mongoose from 'mongoose';
import { app } from './app';
import { connectDB } from './config/dbConfig';
import { appConfig } from './config/appConfig';
import { redisClient } from './config/redis';
import { logger } from './utils/Logger';

const startServer = async () => {
  await connectDB();

  const server = app.listen(appConfig.port, () => {
    logger.info(`Server running on http://localhost:${appConfig.port}`);
  });

  const gracefulShutdown = async (signal: string) => {
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

  process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

startServer();