import { IUser } from "../../../infrastructure/database/models/user.model";
import { CreateMentorInput, ListMentorsQuery, PaginatedMentorsResponse } from "../../../dtos/admin/admin-mentor.dto";

export interface IAdminMentorRepository {
  findUserByEmail(email: string): Promise<IUser | null>;
  createMentor(data: CreateMentorInput, adminId: string): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  findMentorsWithFilters(query: ListMentorsQuery): Promise<PaginatedMentorsResponse>;
  updateMentorStatus(mentorId: string, status: 'ACTIVE' | 'DISABLED', adminId: string): Promise<IUser | null>;
  activateMentor(userId: string, hashedPassword: string): Promise<IUser | null>;
}
