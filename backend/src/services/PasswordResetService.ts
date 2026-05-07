import crypto from 'crypto';
import { IAuthRepository } from '../interfaces/repository-interfaces/IUserRepository';
import { IEmailService } from '../interfaces/service-interfaces/IEmailService';
import { IPasswordResetService } from '../interfaces/service-interfaces/IPasswordResetService';
import { passwordService } from '../utils/passwordService';
import { ICacheService } from '../interfaces/service-interfaces/ICacheService';
import { REDIS_KEYS } from '../constants/redisKeys';
import { EXPIRY_TIMES } from '../constants/expiry';
import { AppError } from '../utils/AppError';
import { STATUS_CODES } from '../constants/status';
import { AUTH_MESSAGES } from '../constants/messages';
import { logger } from '../utils/Logger';

import { ResetPasswordDTO } from '../dtos/ResetPasswordDTO';

export class PasswordResetService implements IPasswordResetService {
  constructor(
    private userRepo: IAuthRepository,
    private emailService: IEmailService,
    private cacheService: ICacheService,
  ) {}

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);

    // Silently return even if user not found — avoids email enumeration
    if (!user || user.isBlocked) return;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    await this.cacheService.set(
      REDIS_KEYS.RESET_PASSWORD(hashedToken),
      user.id,
      EXPIRY_TIMES.PASSWORD_RESET.SECONDS,
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
    await this.emailService.sendPasswordResetLink(user.email, resetLink);

    logger.info(`Password reset link sent to: ${email}`);
  }

  async resetPassword(input: ResetPasswordDTO): Promise<void> {
    const { token, newPassword } = input;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const userId = await this.cacheService.get<string>(REDIS_KEYS.RESET_PASSWORD(hashedToken));


    if (!userId) throw new AppError(AUTH_MESSAGES.INVALID_TOKEN, STATUS_CODES.BAD_REQUEST);

    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError(AUTH_MESSAGES.INVALID_TOKEN, STATUS_CODES.BAD_REQUEST);

    user.password = await passwordService.hash(newPassword);
    await user.save();

    await this.cacheService.del(REDIS_KEYS.RESET_PASSWORD(hashedToken));
    logger.info(`Password reset successful for userId: ${userId}`);
  }

  async validateResetToken(token: string): Promise<boolean> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const userId = await this.cacheService.get<string>(REDIS_KEYS.RESET_PASSWORD(hashedToken));
    return !!userId;
  }
}
