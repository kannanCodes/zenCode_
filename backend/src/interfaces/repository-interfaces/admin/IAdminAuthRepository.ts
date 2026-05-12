import { IUser } from '../../../infrastructure/database/models/user.model';

export interface IAdminAuthRepository {
  findAdminByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
}
