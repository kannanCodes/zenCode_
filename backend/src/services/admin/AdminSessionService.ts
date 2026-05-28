import { IAdminSessionService } from '../../interfaces/service-interfaces/admin/IAdminSessionService';
import { IAdminSessionRepository } from '../../interfaces/repository-interfaces/admin/IAdminSessionRepository';
import {
  AdminSessionQueryDto,
  AdminSessionPaginatedResponse,
  AdminSessionDetailsDto,
} from '../../dtos/admin/admin-session.dto';
import { AppError } from '../../shared/utils/AppError';
import { STATUS_CODES } from '../../shared/constants/status';

export class AdminSessionService implements IAdminSessionService {
  constructor(private readonly _sessionRepo: IAdminSessionRepository) {}

  async getSessions(query: AdminSessionQueryDto): Promise<AdminSessionPaginatedResponse> {
    return this._sessionRepo.getSessions(query);
  }

  async getSessionDetails(id: string): Promise<AdminSessionDetailsDto> {
    const session = await this._sessionRepo.getSessionDetails(id);
    if (!session) {
      throw new AppError('Session not found', STATUS_CODES.NOT_FOUND);
    }
    return session;
  }
}
