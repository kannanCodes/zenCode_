import { CreateMentorInput, ListMentorsQuery, PaginatedMentorsResponse } from "../../../dtos/admin/admin-mentor.dto";

export interface IAdminMentorService {
  createMentor(adminId: string, data: CreateMentorInput): Promise<void>;
  updateMentorStatus(mentorId: string, status: 'ACTIVE' | 'DISABLED', adminId: string): Promise<void>;
  listMentors(query: ListMentorsQuery): Promise<PaginatedMentorsResponse>;
  resendMentorInvite(mentorId: string): Promise<void>;
}
