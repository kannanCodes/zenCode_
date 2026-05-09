import { Server as HttpServer } from 'http';
import { app } from '../app';
import { connectDB } from '../config/dbConfig';
import { appConfig } from '../config/appConfig';
import { logger } from '../shared/utils/Logger';

export class Server {
  private server: HttpServer | null = null;

  async start(): Promise<HttpServer> {
    await connectDB();

    return new Promise((resolve) => {
      this.server = app.listen(appConfig.port, () => {
        logger.info(`Server running on http://localhost:${appConfig.port}`);
        resolve(this.server!);
      });
    });
  }

  getServer(): HttpServer | null {
    return this.server;
  }
}
