import cron from 'node-cron';
import { IMentorSessionService } from '../interfaces/service-interfaces/mentor/IMentorSessionService';
import { logger } from '../shared/utils/Logger';

export class MentorSessionCronJobs {
  constructor(private readonly sessionService: IMentorSessionService) {}

  start() {
    cron.schedule('* * * * *', async () => {
      try {
        await this.sessionService.runSessionCleanup();
      } catch (error) {
        logger.error('Failed to run session cleanup cron job', error);
      }
    });

    logger.info('Mentor Session Cron Jobs initialized');
  }
}
