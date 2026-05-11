import User, { IUser } from "../../infrastructure/database/models/user.model";
import { UserRole } from "../../shared/constants/roles";

export class AdminAuthRepository {
  async findAdminByEmail(email: string): Promise<IUser | null> {
    return User.findOne({
      email,
      role: UserRole.ADMIN,
    }).exec();
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }
}
