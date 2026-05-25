import { IUser } from "../../../infrastructure/database/models/user.model";
import { BaseRepository } from "../../../infrastructure/database/repositories/base/base.repository";
import { ListCandidateMentorsQuery } from "../../../dtos/candidate/candidate-mentor.dto";

export interface CandidateMentorListResult {
  data: IUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ICandidateMentorRepository extends BaseRepository<IUser> {
  findActiveMentors(query: ListCandidateMentorsQuery): Promise<CandidateMentorListResult>;
  findActiveMentorById(mentorId: string): Promise<IUser | null>;
  findActiveMentorSkills(): Promise<string[]>;
}
