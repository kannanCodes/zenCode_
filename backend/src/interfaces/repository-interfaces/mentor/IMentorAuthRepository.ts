import { IUser } from "../../../infrastructure/database/models/user.model";

export interface IMentorAuthRepository {
  findMentorByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
}
