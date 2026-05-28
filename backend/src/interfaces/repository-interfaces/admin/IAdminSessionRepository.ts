import { AdminSessionQueryDto, AdminSessionPaginatedResponse, AdminSessionDetailsDto } from '../../../dtos/admin/admin-session.dto';

export interface IAdminSessionRepository {
  getSessions(query: AdminSessionQueryDto): Promise<AdminSessionPaginatedResponse>;
  getSessionDetails(id: string): Promise<AdminSessionDetailsDto | null>;
}
