import User, { IUser } from "../../infrastructure/database/models/user.model";
import { UserRole } from "../../shared/constants/roles";
import { IMentorAuthRepository } from "../../interfaces/repository-interfaces/mentor/IMentorAuthRepository";
import { BaseRepository } from "../../infrastructure/database/repositories/base/base.repository";

export class MentorAuthRepository extends BaseRepository<IUser> implements IMentorAuthRepository {
  constructor() {
    super(User);
  }

  async findMentorByEmail(email: string): Promise<IUser | null> {
    return this.findOne({
      email,
      role: UserRole.MENTOR,
    });
  }
}
