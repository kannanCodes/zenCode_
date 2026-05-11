import User, { IUser } from "../../infrastructure/database/models/user.model";
import { UserRole } from "../../shared/constants/roles";
import { IMentorAuthRepository } from "../../interfaces/repository-interfaces/mentor/IMentorAuthRepository";

export class MentorAuthRepository implements IMentorAuthRepository {
  async findMentorByEmail(email: string): Promise<IUser | null> {
    return User.findOne({
      email,
      role: UserRole.MENTOR,
    }).exec();
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }
}
