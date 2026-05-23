import crypto from 'crypto';
import { IAdminMentorService } from "../../interfaces/service-interfaces/admin/IAdminMentorService";
import { IAdminMentorRepository } from "../../interfaces/repository-interfaces/admin/IAdminMentorRepository";
import { IEmailService } from "../../interfaces/service-interfaces/auth/IEmailService";
import { ITokenLifecycleRepository } from "../../interfaces/repository-interfaces/auth/ITokenLifecycleRepository";
import { CreateMentorInput, ListMentorsQuery, PaginatedMentorsResponse } from "../../dtos/admin/admin-mentor.dto";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import { EXPIRY_TIMES } from "../../shared/utils/expiry.util";
import { UserRole } from "../../shared/constants/roles";
import { appConfig } from "../../config/appConfig";
import { ADMIN_MESSAGES } from "../../constants/messages";
import { logger } from "../../shared/utils/Logger";

export class AdminMentorService implements IAdminMentorService {
  constructor(
    private readonly _adminMentorRepository: IAdminMentorRepository,
    private readonly _emailService: IEmailService,
    private readonly _tokenLifecycleRepository: ITokenLifecycleRepository
  ) {}

  private async _issueInviteForEmail(input: { email: string; fullName: string }): Promise<void> {
    const { email, fullName } = input;

    const inviteToken = crypto.randomUUID();
    await this._tokenLifecycleRepository.issueMentorInviteToken({
      token: inviteToken,
      email,
      ttlSeconds: EXPIRY_TIMES.MENTOR_INVITE.SECONDS,
    });

    const inviteLink = `${appConfig.frontendUrl}/mentor/activate?token=${inviteToken}`;

    await this._emailService.sendMentorSetupLink({
      email,
      inviteLink,
      fullName,
    });
  }

  async createMentor(adminId: string, data: CreateMentorInput): Promise<void> {
    const existingUser = await this._adminMentorRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new AppError(ADMIN_MESSAGES.USER_ALREADY_EXISTS, STATUS_CODES.CONFLICT);
    }

    await this._adminMentorRepository.createMentor(data, adminId);

    void this._issueInviteForEmail({
      email: data.email,
      fullName: data.fullName,
    }).catch((error) => {
      logger.error(`Failed to send mentor invite to ${data.email}:`, error);
    });
  }

  async updateMentorStatus(mentorId: string, status: 'ACTIVE' | 'DISABLED', adminId: string): Promise<void> {
    const mentor = await this._adminMentorRepository.findById(mentorId);

    if (!mentor) {
      throw new AppError(ADMIN_MESSAGES.MENTOR_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    if (mentor.role !== UserRole.MENTOR) {
      throw new AppError(ADMIN_MESSAGES.MENTOR_INVALID_OPERATION, STATUS_CODES.BAD_REQUEST);
    }

    if (!mentor.mentorStatus) {
      throw new AppError(ADMIN_MESSAGES.MENTOR_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    if (!['ACTIVE', 'DISABLED'].includes(status)) {
      throw new AppError(ADMIN_MESSAGES.INVALID_STATUS_VALUE, STATUS_CODES.BAD_REQUEST);
    }

    const currentStatus = mentor.mentorStatus;

    if (currentStatus === 'INVITED' && status === 'DISABLED') {
      throw new AppError(ADMIN_MESSAGES.CANNOT_DISABLE_INVITED, STATUS_CODES.BAD_REQUEST);
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
      throw new AppError(ADMIN_MESSAGES.MENTOR_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    if (mentor.role !== UserRole.MENTOR) {
      throw new AppError(ADMIN_MESSAGES.MENTOR_INVALID_OPERATION, STATUS_CODES.BAD_REQUEST);
    }

    if (!mentor.mentorStatus) {
      throw new AppError(ADMIN_MESSAGES.MENTOR_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    if (mentor.mentorStatus === 'ACTIVE') {
      throw new AppError(ADMIN_MESSAGES.CANNOT_RESEND_ACTIVE, STATUS_CODES.BAD_REQUEST);
    }

    if (mentor.mentorStatus === 'DISABLED') {
      throw new AppError(ADMIN_MESSAGES.MENTOR_DISABLED_CANNOT_RESEND, STATUS_CODES.BAD_REQUEST);
    }

    await this._issueInviteForEmail({
      email: mentor.email,
      fullName: mentor.fullName,
    });
  }
}
