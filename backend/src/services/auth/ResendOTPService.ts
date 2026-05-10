import { IOTPService } from '../../interfaces/service-interfaces/auth/IOTPService';
import { IOTPRepository } from '../../interfaces/repository-interfaces/auth/IOTPRepository';
import { IEmailService } from '../../interfaces/service-interfaces/auth/IEmailService';
import { RegistrationCacheDTO } from '../../dtos/auth/register.dto';
import { AppError } from '../../utils/AppError';
import { STATUS_CODES } from '../../constants/status';
import { AUTH_MESSAGES } from '../../constants/messages';
import { OTP_LIMITS } from '../../constants/otp.constants';
import { logger } from '../../utils/Logger';

import { IResendOTPService } from '../../interfaces/service-interfaces/auth/IResendOTPService';

export class ResendOTPService implements IResendOTPService {

  constructor(
    private otpService: IOTPService,
    private otpRepo: IOTPRepository,
    private emailService: IEmailService,
  ) { }

  async resend(email: string): Promise<void> {
    const data = await this.otpService.getRegistrationData<RegistrationCacheDTO>(email);
    if (!data) throw new AppError(AUTH_MESSAGES.REGISTRATION_NOT_FOUND, STATUS_CODES.NOT_FOUND);

    const meta = await this.otpRepo.getMeta(email);
    const now = Date.now();

    if (meta) {
      const diffSeconds = (now - meta.lastSend) / 1000;

      if (diffSeconds < OTP_LIMITS.RESEND_COOLDOWN_SECONDS) {
        throw new AppError(AUTH_MESSAGES.OTP_COOLDOWN_ACTIVE, STATUS_CODES.BAD_REQUEST);
      }

      if (meta.resendCount >= OTP_LIMITS.MAX_RESEND_ATTEMPTS) {
        throw new AppError(AUTH_MESSAGES.OTP_RESEND_LIMIT_EXCEEDED, STATUS_CODES.BAD_REQUEST);
      }
    }

    const otp = this.otpService.generateOTP();
    await this.otpService.storeOTP(email, otp);

    await this.otpRepo.saveMeta(
      email,
      { resendCount: meta ? meta.resendCount + 1 : 1, lastSend: now },
      OTP_LIMITS.RESEND_COOLDOWN_SECONDS * 10,
    );

    await this.emailService.sendOTP(email, otp);
    logger.info(`OTP resent to: ${email}`);
  }
}