import { IUser } from "../../../infrastructure/database/models/user.model";
import { BaseRepository } from "../../../infrastructure/database/repositories/base/base.repository";
import { UpdateMentorProfileInput } from "../../../dtos/mentor/mentor-profile.dto";

export interface IMentorProfileRepository extends BaseRepository<IUser> {
  findMentorProfileById(mentorId: string): Promise<IUser | null>;
  updateMentorProfile(mentorId: string, data: UpdateMentorProfileInput): Promise<IUser | null>;
}
