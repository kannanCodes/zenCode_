import { IUser } from "../../../infrastructure/database/models/user.model";
import { BaseRepository } from "../../../infrastructure/database/repositories/base/base.repository";

export interface ICandidateMentorRepository extends BaseRepository<IUser> {
  findActiveMentors(): Promise<IUser[]>;
  findActiveMentorById(mentorId: string): Promise<IUser | null>;
}
