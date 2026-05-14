import User, { IUser } from '../../infrastructure/database/models/user.model';
import { IAuthRepository } from '../../interfaces/repository-interfaces/auth/IUserRepository';
import { BaseRepository } from "../../infrastructure/database/repositories/base/base.repository";

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

  async updateLastActive(userId: string): Promise<void> {
    await this.updateOne({ _id: userId }, { $set: { lastActiveDate: new Date() } });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.updateOne({ _id: userId }, { $set: { password: hashedPassword } });
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<void> {
    await this.updateOne({ _id: userId }, { $set: { googleId, isEmailVerified: true } });
  }
}