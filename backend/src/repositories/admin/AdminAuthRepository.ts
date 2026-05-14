import User, { IUser } from "../../infrastructure/database/models/user.model";
import { UserRole } from "../../shared/constants/roles";
import { BaseRepository } from "../../infrastructure/database/repositories/base/base.repository";
import { IAdminAuthRepository } from "../../interfaces/repository-interfaces/admin/IAdminAuthRepository";

export class AdminAuthRepository extends BaseRepository<IUser> implements IAdminAuthRepository {
  constructor() {
    super(User);
  }

  async findAdminByEmail(email: string): Promise<IUser | null> {
    return this.findOne({
      email,
      role: UserRole.ADMIN,
    });
  }
}
