import { Server as HttpServer } from 'http';
import { app } from '../app';
import { connectDB } from '../config/dbConfig';
import { appConfig } from '../config/appConfig';
import { logger } from "../shared/utils/Logger";
import { subscriptionCronJobs } from '../shared/di/payment.container';
import { initializeSocketServer } from '../infrastructure/websocket/socket.server';

import { mentorSessionCronJobs } from '../shared/di/mentor.container';

export class Server {
  private httpServer?: HttpServer;

  async start(): Promise<void> {
    await connectDB();
    subscriptionCronJobs.start();
    mentorSessionCronJobs.start();

    this.httpServer = app.listen(appConfig.port, () => {
      logger.info(`Server running on http://localhost:${appConfig.port}`);
    });

    initializeSocketServer(this.httpServer);
  }

  getHttpServer(): HttpServer | undefined {
    return this.httpServer;
  }
}
