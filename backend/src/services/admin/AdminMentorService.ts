import crypto from 'crypto';
import { IAdminMentorService } from "../../interfaces/service-interfaces/admin/IAdminMentorService";
import { IAdminMentorRepository } from "../../interfaces/repository-interfaces/admin/IAdminMentorRepository";
import { IEmailService } from "../../interfaces/service-interfaces/auth/IEmailService";
import { ICacheService } from "../../interfaces/service-interfaces/auth/ICacheService";
import { CreateMentorInput, ListMentorsQuery, PaginatedMentorsResponse } from "../../dtos/admin/admin-mentor.dto";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import { REDIS_KEYS } from "../../constants/redisKeys";
import { EXPIRY_TIMES } from "../../shared/utils/expiry.util";
import { UserRole } from "../../shared/constants/roles";

export class AdminMentorService implements IAdminMentorService {
  constructor(
    private readonly _adminMentorRepository: IAdminMentorRepository,
    private readonly _emailService: IEmailService,
    private readonly _cacheService: ICacheService
  ) {}

  private async _issueInviteForEmail(input: { email: string; fullName: string }): Promise<void> {
    const { email, fullName } = input;

    const inviteToken = crypto.randomUUID();

    const emailKey = REDIS_KEYS.MENTOR_INVITE_BY_EMAIL(email);
    const existingToken = await this._cacheService.get<string>(emailKey);

    if (existingToken) {
      await this._cacheService.del(REDIS_KEYS.MENTOR_INVITE(existingToken));
    }

    await this._cacheService.set(
      REDIS_KEYS.MENTOR_INVITE(inviteToken),
      email,
      EXPIRY_TIMES.MENTOR_INVITE.SECONDS
    );
    await this._cacheService.set(
      emailKey,
      inviteToken,
      EXPIRY_TIMES.MENTOR_INVITE.SECONDS
    );

    const inviteLink = `${process.env.FRONTEND_URL}/mentor/activate?token=${inviteToken}`;

    await this._emailService.sendMentorSetupLink({
      email,
      inviteLink,
      fullName,
    });
  }

  async createMentor(adminId: string, data: CreateMentorInput): Promise<void> {
    const existingUser = await this._adminMentorRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new AppError('User Already Exists', STATUS_CODES.CONFLICT);
    }

    await this._adminMentorRepository.createMentor(data, adminId);

    await this._issueInviteForEmail({
      email: data.email,
      fullName: data.fullName,
    });
  }

  async updateMentorStatus(mentorId: string, status: 'ACTIVE' | 'DISABLED', adminId: string): Promise<void> {
    const mentor = await this._adminMentorRepository.findById(mentorId);

    if (!mentor) {
      throw new AppError('Mentor not found', STATUS_CODES.NOT_FOUND);
    }

    if (mentor.role !== UserRole.MENTOR) {
      throw new AppError('Invalid mentor operation', STATUS_CODES.BAD_REQUEST);
    }

    if (!mentor.mentorStatus) {
      throw new AppError('Mentor not found', STATUS_CODES.NOT_FOUND);
    }

    if (!['ACTIVE', 'DISABLED'].includes(status)) {
      throw new AppError('Invalid status value', STATUS_CODES.BAD_REQUEST);
    }

    const currentStatus = mentor.mentorStatus;

    if (currentStatus === 'INVITED' && status === 'DISABLED') {
      throw new AppError('Cannot disable invited mentor', STATUS_CODES.BAD_REQUEST);
    }

    if (currentStatus === 'ACTIVE' && status === 'ACTIVE') return;
    if (currentStatus === 'DISABLED' && status === 'DISABLED') return;

    await this._adminMentorRepository.updateMentorStatus(mentorId, status, adminId);
  }

  async listMentors(query: ListMentorsQuery): Promise<PaginatedMentorsResponse> {
    
    return this._adminMentorRepository.findMentorsWithFilters(query);
  }

  async resendMentorInvite(mentorId: string): Promise<void> {
    const mentor = await this._adminMentorRepository.findById(mentorId);

    if (!mentor) {
      throw new AppError('Mentor not found', STATUS_CODES.NOT_FOUND);
    }

    if (mentor.role !== UserRole.MENTOR) {
      throw new AppError('Invalid mentor operation', STATUS_CODES.BAD_REQUEST);
    }

    if (!mentor.mentorStatus) {
      throw new AppError('Mentor not found', STATUS_CODES.NOT_FOUND);
    }

    if (mentor.mentorStatus === 'ACTIVE') {
      throw new AppError('Cannot resend invite for active mentor', STATUS_CODES.BAD_REQUEST);
    }

    if (mentor.mentorStatus === 'DISABLED') {
      throw new AppError('Mentor disabled by admin', STATUS_CODES.BAD_REQUEST);
    }

    await this._issueInviteForEmail({
      email: mentor.email,
      fullName: mentor.fullName,
    });
  }
}
