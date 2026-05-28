import { NOTIFICATION_CONFIG } from '../../constants/notification.constants';


export interface NotificationQueryDto {
  page?: number;
  limit?: number;
}


export function parseNotificationQuery(query: Record<string, unknown>): NotificationQueryDto {
  const page  = parseInt(String(query.page  ?? 1), 10);
  const limit = parseInt(String(query.limit ?? NOTIFICATION_CONFIG.DEFAULT_PAGE_SIZE), 10);

  return {
    page:  isNaN(page)  || page  < 1 ? 1 : page,
    limit: isNaN(limit) || limit < 1 || limit > NOTIFICATION_CONFIG.MAX_PAGE_SIZE
      ? NOTIFICATION_CONFIG.DEFAULT_PAGE_SIZE
      : limit,
  };
}
