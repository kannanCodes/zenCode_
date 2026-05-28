import { AdminSessionQueryDto, AdminSessionPaginatedResponse, AdminSessionDetailsDto } from '../../../dtos/admin/admin-session.dto';

export interface IAdminSessionService {
  getSessions(query: AdminSessionQueryDto): Promise<AdminSessionPaginatedResponse>;
  getSessionDetails(id: string): Promise<AdminSessionDetailsDto>;
}
