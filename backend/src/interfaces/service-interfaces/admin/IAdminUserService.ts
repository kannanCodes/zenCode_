import { ListUsersQuery, PaginatedUsersResponse } from "../../../dtos/admin/admin-user.dto";

export interface IAdminUserService {
  listCandidates(query: ListUsersQuery): Promise<PaginatedUsersResponse>;
  blockUser(adminId: string, userId: string): Promise<void>;
  unblockUser(userId: string): Promise<void>;
}
