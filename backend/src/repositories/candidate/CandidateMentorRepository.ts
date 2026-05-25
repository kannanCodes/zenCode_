import { BaseRepository } from "../../infrastructure/database/repositories/base/base.repository";
import User, { IUser } from "../../infrastructure/database/models/user.model";
import {
  CandidateMentorListResult,
  ICandidateMentorRepository,
} from "../../interfaces/repository-interfaces/candidate/ICandidateMentorRepository";
import { UserRole } from "../../shared/constants/roles";
import { ListCandidateMentorsQuery } from "../../dtos/candidate/candidate-mentor.dto";

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export class CandidateMentorRepository extends BaseRepository<IUser> implements ICandidateMentorRepository {
  constructor() {
    super(User);
  }

  async findActiveMentors(query: ListCandidateMentorsQuery): Promise<CandidateMentorListResult> {
    const { search, skills = [], page, limit } = query;
    const filter: Record<string, unknown> = {
      role: UserRole.MENTOR,
      mentorStatus: "ACTIVE",
      isBlocked: false,
    };

    if (skills.length > 0) {
      filter.expertise = { $in: skills.map((skill) => new RegExp(`^${escapeRegex(skill)}$`, "i")) };
    }

    if (search) {
      const term = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { fullName: term },
        { expertise: term },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ activatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password")
        .exec(),
      this.model.countDocuments(filter),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findActiveMentorById(mentorId: string): Promise<IUser | null> {
    return this.findOne({
      _id: mentorId,
      role: UserRole.MENTOR,
      mentorStatus: "ACTIVE",
      isBlocked: false,
    });
  }

  async findActiveMentorSkills(): Promise<string[]> {
    return this.model.distinct("expertise", {
      role: UserRole.MENTOR,
      mentorStatus: "ACTIVE",
      isBlocked: false,
      expertise: { $exists: true, $ne: [] },
    });
  }
}
