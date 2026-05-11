import { IMentorAuthService } from "../../interfaces/service-interfaces/mentor/IMentorAuthService";
import { IMentorAuthRepository } from "../../interfaces/repository-interfaces/mentor/IMentorAuthRepository";
import { IAdminMentorRepository } from "../../interfaces/repository-interfaces/admin/IAdminMentorRepository";
import { ICacheService } from "../../interfaces/service-interfaces/auth/ICacheService";
import { ITokenService } from "../../interfaces/service-interfaces/auth/ITokenService";
import { ActivateMentorInput, MentorLoginInput } from "../../dtos/mentor/mentor-auth.dto";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import { AUTH_MESSAGES } from "../../constants/messages";
import { passwordService } from "../../infrastructure/security/password.service";
import { REDIS_KEYS } from "../../constants/redisKeys";
import { parseExpiryToSeconds } from "../../shared/utils/expiry.util";
import { REFRESH_TOKEN_EXPIRY } from "../../constants/token.constants";
import { UserRole } from "../../shared/constants/roles";

export class MentorAuthService implements IMentorAuthService {
  constructor(
    private readonly _mentorAuthRepository: IMentorAuthRepository,
    private readonly _adminMentorRepository: IAdminMentorRepository,
    private readonly _cacheService: ICacheService,
    private readonly _tokenService: ITokenService
  ) {}

  async activateMentor(input: ActivateMentorInput): Promise<void> {
    const { token, password, confirmPassword } = input;

    if (password !== confirmPassword) {
      throw new AppError('Passwords do not match', STATUS_CODES.BAD_REQUEST);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters', STATUS_CODES.BAD_REQUEST);
    }

    const email = await this._cacheService.get<string>(REDIS_KEYS.MENTOR_INVITE(token));
    if (!email) {
      throw new AppError('Invalid or Expired Invite Link', STATUS_CODES.UNAUTHORIZED);
    }

    const latestTokenForEmail = await this._cacheService.get<string>(REDIS_KEYS.MENTOR_INVITE_BY_EMAIL(email));
    if (!latestTokenForEmail || latestTokenForEmail !== token) {
      throw new AppError('Invalid or Expired Invite Link', STATUS_CODES.UNAUTHORIZED);
    }

    const mentor = await this._adminMentorRepository.findUserByEmail(email);
    if (!mentor) {
      throw new AppError('Mentor Account not Found', STATUS_CODES.NOT_FOUND);
    }

    if (mentor.role !== UserRole.MENTOR) {
      throw new AppError('Invalid mentor operation', STATUS_CODES.BAD_REQUEST);
    }

    if (mentor.mentorStatus === 'DISABLED') {
      throw new AppError('Mentor disabled by admin', STATUS_CODES.FORBIDDEN);
    }

    if (mentor.mentorStatus !== 'INVITED') {
      throw new AppError('Invalid mentor state', STATUS_CODES.CONFLICT);
    }

    const hashedPassword = await passwordService.hash(password);
    await this._adminMentorRepository.activateMentor(mentor.id, hashedPassword);

    await this._cacheService.del(REDIS_KEYS.MENTOR_INVITE(token));
    await this._cacheService.del(REDIS_KEYS.MENTOR_INVITE_BY_EMAIL(email));
  }

  async login(input: MentorLoginInput): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = input;

    const mentor = await this._mentorAuthRepository.findMentorByEmail(email);
    if (!mentor) {
      throw new AppError(AUTH_MESSAGES.USER_NOT_FOUND, STATUS_CODES.UNAUTHORIZED);
    }

    if (mentor.isBlocked) {
      throw new AppError(AUTH_MESSAGES.USER_BLOCKED, STATUS_CODES.FORBIDDEN);
    }

    if (!mentor.isEmailVerified) {
      throw new AppError('Mentor account not activated', STATUS_CODES.FORBIDDEN);
    }

    if (mentor.mentorStatus !== 'ACTIVE') {
      throw new AppError('Account disabled. Contact admin.', STATUS_CODES.FORBIDDEN);
    }

    if (!mentor.password) {
      throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
    }

    const isMatch = await passwordService.compare(password, mentor.password);
    if (!isMatch) {
      throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
    }

    const { accessToken, refreshToken, refreshTokenId } = this._tokenService.generateAuthTokens({
      id: mentor.id,
      role: mentor.role,
    });

    const refreshKey = REDIS_KEYS.REFRESH_TOKEN(refreshTokenId);
    const refreshTTL = parseExpiryToSeconds(REFRESH_TOKEN_EXPIRY);
    await this._cacheService.set(refreshKey, mentor.id, refreshTTL);

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = this._tokenService.verifyRefreshToken(refreshToken);
    if (!payload.tokenId) {
      throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
    }

    const oldKey = REDIS_KEYS.REFRESH_TOKEN(payload.tokenId);
    const storedUserId = await this._cacheService.get<string>(oldKey);

    if (!storedUserId || storedUserId !== payload.sub) {
      throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
    }

    const mentor = await this._mentorAuthRepository.findById(payload.sub);
    if (!mentor || mentor.isBlocked) {
      throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
    }

    await this._cacheService.del(oldKey);

    const { accessToken, refreshToken: newRefreshToken, refreshTokenId } = this._tokenService.generateAuthTokens({
      id: mentor.id,
      role: mentor.role,
    });

    const newKey = REDIS_KEYS.REFRESH_TOKEN(refreshTokenId);
    const ttl = parseExpiryToSeconds(REFRESH_TOKEN_EXPIRY);
    await this._cacheService.set(newKey, mentor.id, ttl);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = this._tokenService.verifyRefreshToken(refreshToken);
      if (payload.tokenId) {
        const key = REDIS_KEYS.REFRESH_TOKEN(payload.tokenId);
        await this._cacheService.del(key);
      }
    } catch {
      return;
    }
  }
}
