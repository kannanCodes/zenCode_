import User, { IUser } from '../../models/UserModel';
import { IAuthRepository } from '../../interfaces/repository-interfaces/auth/IUserRepository';
import { BaseRepository } from '../base/BaseRepository';

export class AuthRepository extends BaseRepository<IUser> implements IAuthRepository {
  constructor() {
    super(User);
  }

  findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email });
  }

  createUser(data: Partial<IUser>): Promise<IUser> {
    return this.create(data);
  }

  updateByEmail(email: string, update: Partial<IUser>): Promise<IUser | null> {
    return this.updateOne({ email }, { $set: update });
  }
}