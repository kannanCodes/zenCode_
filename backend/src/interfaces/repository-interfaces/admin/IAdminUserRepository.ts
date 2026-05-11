import { IUser } from "../../../infrastructure/database/models/user.model";
import { ListUsersQuery, PaginatedUsersResponse } from "../../../dtos/admin/admin-user.dto";

export interface IAdminUserRepository {
  listCandidates(query: ListUsersQuery): Promise<PaginatedUsersResponse>;
  findById(userId: string): Promise<IUser | null>;
  blockUser(userId: string, adminId: string): Promise<IUser | null>;
  unblockUser(userId: string): Promise<IUser | null>;
}
