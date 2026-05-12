import { IUser } from '../../../infrastructure/database/models/user.model';

export interface IAuthRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findById(userId: string): Promise<IUser | null>;
  createUser(data: Partial<IUser>): Promise<IUser>;
  updateByEmail(email: string, update: Partial<IUser>): Promise<IUser | null>;
  updateLastActive(userId: string): Promise<void>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
  linkGoogleAccount(userId: string, googleId: string): Promise<void>;
}