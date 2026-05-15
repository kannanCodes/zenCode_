import { Server as HttpServer } from 'http';
import { app } from '../app';
import { connectDB } from '../config/dbConfig';
import { appConfig } from '../config/appConfig';
import { logger } from "../shared/utils/Logger";
import { subscriptionCronJobs } from '../shared/di/payment.container';

export class Server {
  private httpServer?: HttpServer;

  async start(): Promise<void> {
    await connectDB();
    subscriptionCronJobs.start();

    this.httpServer = app.listen(appConfig.port, () => {
      logger.info(`Server running on http://localhost:${appConfig.port}`);
    });
  }

  getHttpServer(): HttpServer | undefined {
    return this.httpServer;
  }
}
