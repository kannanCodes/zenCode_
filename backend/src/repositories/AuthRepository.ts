import User, { IUser } from '../models/UserModel';
import { IAuthRepository } from '../interfaces/repository-interfaces/IUserRepository';

export class AuthRepository implements IAuthRepository {
  findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).exec();
  }

  findById(userId: string): Promise<IUser | null> {
    return User.findById(userId).exec();
  }

  createUser(data: Partial<IUser>): Promise<IUser> {
    return new User(data).save();
  }

  updateByEmail(email: string, update: Partial<IUser>): Promise<IUser | null> {
    return User.findOneAndUpdate({ email }, { $set: update }, { new: true }).exec();
  }
}