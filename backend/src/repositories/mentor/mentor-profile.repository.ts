import User, { IUser } from "../../infrastructure/database/models/user.model";
import { BaseRepository } from "../../infrastructure/database/repositories/base/base.repository";
import { IMentorProfileRepository } from "../../interfaces/repository-interfaces/mentor/IMentorProfileRepository";
import { UpdateMentorProfileInput } from "../../dtos/mentor/mentor-profile.dto";
import { UserRole } from "../../shared/constants/roles";

export class MentorProfileRepository extends BaseRepository<IUser> implements IMentorProfileRepository {
  constructor() {
    super(User);
  }

  async findMentorProfileById(mentorId: string): Promise<IUser | null> {
    return this.findOne({
      _id: mentorId,
      role: UserRole.MENTOR,
      isBlocked: false,
    });
  }

  async updateMentorProfile(mentorId: string, data: UpdateMentorProfileInput): Promise<IUser | null> {
    const { title, bio, ...rest } = data;

    return this.updateOne(
      {
        _id: mentorId,
        role: UserRole.MENTOR,
      },
      {
        $set: {
          ...rest,
          ...(title !== undefined ? { mentorTitle: title } : {}),
          ...(bio !== undefined ? { mentorBio: bio } : {}),
        },
        $unset: {
          ...(title === "" ? { mentorTitle: 1 } : {}),
          ...(bio === "" ? { mentorBio: 1 } : {}),
        },
      }
    );
  }
}
