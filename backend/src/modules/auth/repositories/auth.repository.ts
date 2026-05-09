import User, { IUser } from '../../../infrastructure/database/models/user.model';
import { IAuthRepository } from '../interfaces/repository-interfaces/IUserRepository';
import { BaseRepository } from '../../../infrastructure/database/repositories/base/base.repository';

export class AuthRepository extends BaseRepository<IUser> implements IAuthRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email });
  }

  async createUser(data: Partial<IUser>): Promise<IUser> {
    return this.create(data);
  }

  async updateByEmail(email: string, update: Partial<IUser>): Promise<IUser | null> {
    return this.updateOne({ email }, { $set: update });
  }
}
