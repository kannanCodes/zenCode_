import mongoose from 'mongoose';
import User, { IUser } from "../../infrastructure/database/models/user.model";
import { BaseRepository } from "../../infrastructure/database/repositories/base/base.repository";
import { IAdminUserRepository } from "../../interfaces/repository-interfaces/admin/IAdminUserRepository";
import { ListUsersQuery, PaginatedUsersResponse } from "../../dtos/admin/admin-user.dto";
import { UserRole } from "../../shared/constants/roles";

export class AdminUserRepository extends BaseRepository<IUser> implements IAdminUserRepository {
  constructor() {
    super(User);
  }

  async listCandidates(query: ListUsersQuery): Promise<PaginatedUsersResponse> {
    const { page, limit, search, isBlocked, sortBy, sortOrder } = query;

    const filter: Record<string, unknown> = {
      role: UserRole.CANDIDATE,
    };

    if (typeof isBlocked === 'boolean') {
      filter.isBlocked = isBlocked;
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const sortFieldWhitelist = new Set(['createdAt', 'lastActiveDate', 'email']);
    const finalSortBy = sortFieldWhitelist.has(sortBy) ? sortBy : 'createdAt';

    const [users, total] = await Promise.all([
      this.model.find(filter)
        .select('-password -googleId')
        .sort({ [finalSortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(filter),
    ]);

    return {
      users,
      total,
    };
  }

  async blockUser(userId: string, adminId: string): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      {
        isBlocked: true,
        blockedAt: new Date(),
        blockedByAdminId: new mongoose.Types.ObjectId(adminId),
      },
      { new: true }
    ).exec();
  }

  async unblockUser(userId: string): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      {
        isBlocked: false,
        blockedAt: null,
        blockedByAdminId: null,
      },
      { new: true }
    ).exec();
  }
}
