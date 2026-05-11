import mongoose from 'mongoose';
import User, { IUser } from "../../infrastructure/database/models/user.model";
import { BaseRepository } from "../base/BaseRepository";
import { IAdminMentorRepository } from "../../interfaces/repository-interfaces/admin/IAdminMentorRepository";
import { CreateMentorInput, ListMentorsQuery, PaginatedMentorsResponse } from "../../dtos/admin/admin-mentor.dto";
import { UserRole } from "../../shared/constants/roles";

export class AdminMentorRepository extends BaseRepository<IUser> implements IAdminMentorRepository {
  constructor() {
    super(User);
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email }).exec();
  }

  async createMentor(data: CreateMentorInput, adminId: string): Promise<IUser> {
    return this.model.create({
      fullName: data.fullName,
      email: data.email,
      role: UserRole.MENTOR,
      expertise: data.expertise,
      experienceLevel: data.experienceLevel,
      isEmailVerified: false,
      mentorStatus: 'INVITED',
      invitedAt: new Date(),
      createdByAdminId: new mongoose.Types.ObjectId(adminId),
    });
  }

  async findMentorsWithFilters(query: ListMentorsQuery): Promise<PaginatedMentorsResponse> {
    const {
      page,
      limit,
      status,
      experienceLevel,
      isBlocked,
      expertise,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: Record<string, unknown> = {
      role: UserRole.MENTOR,
    };

    if (status) filter.mentorStatus = status;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (typeof isBlocked === 'boolean') filter.isBlocked = isBlocked;
    if (expertise) filter.expertise = expertise;

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { expertise: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const sortFieldWhitelist = new Set([
      'createdAt',
      'invitedAt',
      'activatedAt',
      'experienceLevel',
      'mentorStatus',
    ]);

    const finalSortBy = sortFieldWhitelist.has(sortBy) ? sortBy : 'createdAt';

    const sort: { [key: string]: 1 | -1 } = {
      [finalSortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [data, total] = await Promise.all([
      this.model.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-password')
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

  async updateMentorStatus(mentorId: string, status: 'ACTIVE' | 'DISABLED', adminId: string): Promise<IUser | null> {
    const update: Record<string, unknown> = {
      mentorStatus: status,
      lastStatusChangedAt: new Date(),
      lastStatusChangedByAdminId: new mongoose.Types.ObjectId(adminId),
    };

    if (status === 'DISABLED') {
      update.disabledAt = new Date();
    }

    if (status === 'ACTIVE') {
      update.disabledAt = null; // Use null to clear it in Mongoose
    }

    return this.model.findByIdAndUpdate(mentorId, update, { new: true }).exec();
  }

  async activateMentor(userId: string, hashedPassword: string): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
        isEmailVerified: true,
        mentorStatus: 'ACTIVE',
        activatedAt: new Date(),
      },
      { new: true }
    ).exec();
  }
}
