import crypto from 'crypto';
import { IAuthRepository } from '../../interfaces/repository-interfaces/auth/IUserRepository';
import { IEmailService } from '../../interfaces/service-interfaces/auth/IEmailService';
import { IPasswordResetService } from '../../interfaces/service-interfaces/auth/IPasswordResetService';
import { IPasswordService } from '../../interfaces/infrastructure-interfaces/security/IPasswordService';
import { ICacheService } from '../../interfaces/service-interfaces/auth/ICacheService';
import { REDIS_KEYS } from '../../constants/redisKeys';
import { EXPIRY_TIMES } from "../../shared/utils/expiry.util";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import { AUTH_MESSAGES } from "../../constants/messages";
import { logger } from "../../shared/utils/Logger";

import { ResetPasswordDTO } from '../../dtos/auth/password.dto';
import { appConfig } from '../../config/appConfig';
import { FRONTEND_ROUTES } from "../../shared/constants/frontend-routes";

export class PasswordResetService implements IPasswordResetService {
  constructor(
    private userRepo: IAuthRepository,
    private emailService: IEmailService,
    private cacheService: ICacheService,
    private passwordService: IPasswordService,
  ) { }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);

    if (!user || user.isBlocked) return;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    await this.cacheService.set(
      REDIS_KEYS.RESET_PASSWORD(hashedToken),
      user.id,
      EXPIRY_TIMES.PASSWORD_RESET.SECONDS,
    );

    const resetLink = `${appConfig.frontendUrl}${FRONTEND_ROUTES.RESET_PASSWORD}?token=${rawToken}`;
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

    const hashedPassword = await this.passwordService.hash(newPassword);
    await this.userRepo.updatePassword(userId, hashedPassword);

    await this.cacheService.del(REDIS_KEYS.RESET_PASSWORD(hashedToken));
    logger.info(`Password reset successful for userId: ${userId}`);
  }

  async validateResetToken(token: string): Promise<boolean> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const userId = await this.cacheService.get<string>(REDIS_KEYS.RESET_PASSWORD(hashedToken));
    return !!userId;
  }
}
