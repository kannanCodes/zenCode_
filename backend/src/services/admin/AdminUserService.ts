import { IAdminUserService } from "../../interfaces/service-interfaces/admin/IAdminUserService";
import { IAdminUserRepository } from "../../interfaces/repository-interfaces/admin/IAdminUserRepository";
import { ListUsersQuery, PaginatedUsersResponse } from "../../dtos/admin/admin-user.dto";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import { UserRole } from "../../shared/constants/roles";

export class AdminUserService implements IAdminUserService {
  constructor(private readonly _adminUserRepository: IAdminUserRepository) {}

  async listCandidates(query: ListUsersQuery): Promise<PaginatedUsersResponse> {
    return this._adminUserRepository.listCandidates(query);
  }

  async blockUser(adminId: string, userId: string): Promise<void> {
    const user = await this._adminUserRepository.findById(userId);

    if (!user || user.role !== UserRole.CANDIDATE) {
      throw new AppError('Candidate not found', STATUS_CODES.NOT_FOUND);
    }

    if (user.isBlocked) return;

    await this._adminUserRepository.blockUser(userId, adminId);
  }

  async unblockUser(userId: string): Promise<void> {
    const user = await this._adminUserRepository.findById(userId);

    if (!user || user.role !== UserRole.CANDIDATE) {
      throw new AppError('Candidate not found', STATUS_CODES.NOT_FOUND);
    }

    if (!user.isBlocked) return;

    await this._adminUserRepository.unblockUser(userId);
  }
}
