import { IAdminSessionService } from '../../interfaces/service-interfaces/admin/IAdminSessionService';
import { IAdminSessionRepository } from '../../interfaces/repository-interfaces/admin/IAdminSessionRepository';
import {
  AdminSessionQueryDto,
  AdminSessionPaginatedResponse,
  AdminSessionDetailsDto,
} from '../../dtos/admin/admin-session.dto';
import { AppError } from '../../shared/utils/AppError';
import { STATUS_CODES } from '../../shared/constants/status';
import { BOOKING_MESSAGES } from '../../constants/messages';

export class AdminSessionService implements IAdminSessionService {
  constructor(private readonly _sessionRepo: IAdminSessionRepository) {}

  async getSessions(query: AdminSessionQueryDto): Promise<AdminSessionPaginatedResponse> {
    return this._sessionRepo.getSessions(query);
  }

  async getSessionDetails(id: string): Promise<AdminSessionDetailsDto> {
    const session = await this._sessionRepo.getSessionDetails(id);
    if (!session) {
      throw new AppError(BOOKING_MESSAGES.SESSION_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }
    return session;
  }
}
