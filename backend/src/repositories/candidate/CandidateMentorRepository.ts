import { BaseRepository } from "../../infrastructure/database/repositories/base/base.repository";
import User, { IUser } from "../../infrastructure/database/models/user.model";
import { ICandidateMentorRepository } from "../../interfaces/repository-interfaces/candidate/ICandidateMentorRepository";
import { UserRole } from "../../shared/constants/roles";

export class CandidateMentorRepository extends BaseRepository<IUser> implements ICandidateMentorRepository {
  constructor() {
    super(User);
  }

  async findActiveMentors(): Promise<IUser[]> {
    return this.model.find({
      role: UserRole.MENTOR,
      mentorStatus: "ACTIVE",
      isBlocked: false,
    }).exec();
  }

  async findActiveMentorById(mentorId: string): Promise<IUser | null> {
    return this.findOne({
      _id: mentorId,
      role: UserRole.MENTOR,
      mentorStatus: "ACTIVE",
      isBlocked: false,
    });
  }
}
