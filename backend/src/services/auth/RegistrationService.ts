import { IAuthRepository as IUserRepository } from '../../interfaces/repository-interfaces/auth/IUserRepository';
import { IOTPService } from '../../interfaces/service-interfaces/auth/IOTPService';
import { IEmailService } from '../../interfaces/service-interfaces/auth/IEmailService';
import { passwordService } from '../../utils/passwordService';
import { UserRole } from '../../constants/roles';
import { StartRegistrationDTO, VerifyRegistrationDTO } from '../../dtos/auth/register.dto';
import { RegistrationCacheDTO } from '../../dtos/auth/register.dto';
import { AppError } from '../../utils/AppError';
import { STATUS_CODES } from '../../constants/status';
import { AUTH_MESSAGES } from '../../constants/messages';
import { logger } from '../../utils/Logger';

import { IRegistrationService } from '../../interfaces/service-interfaces/auth/IRegistrationService';

export class RegistrationService implements IRegistrationService {

  constructor(
    private userRepo: IUserRepository,
    private otpService: IOTPService,
    private emailService: IEmailService,
  ) { }

  async startRegistration(input: StartRegistrationDTO): Promise<void> {
    const { fullName, email, password, confirmPassword } = input;

    if (password !== confirmPassword) {
      throw new AppError(AUTH_MESSAGES.PASSWORDS_DO_NOT_MATCH, STATUS_CODES.BAD_REQUEST);
    }

    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      throw new AppError(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS, STATUS_CODES.CONFLICT);
    }

    const otp = this.otpService.generateOTP();
    await this.otpService.storeOTP(email, otp);
    await this.otpService.storeRegistrationData<RegistrationCacheDTO>(email, {
      fullName: fullName!,
      email,
      password: password!,
    });

    await this.emailService.sendOTP(email, otp);
    logger.info(`Registration OTP sent to: ${email}`);
  }

  async verifyRegistration(input: VerifyRegistrationDTO): Promise<void> {
    const { email, otp } = input;

    const isValid = await this.otpService.verifyOTP(email, otp);
    if (!isValid) {
      throw new AppError(AUTH_MESSAGES.INVALID_OTP, STATUS_CODES.BAD_REQUEST);
    }

    const data = await this.otpService.getRegistrationData<RegistrationCacheDTO>(email);
    if (!data) {
      throw new AppError(AUTH_MESSAGES.REGISTRATION_DATA_EXPIRED, STATUS_CODES.BAD_REQUEST);
    }

    const hashed = await passwordService.hash(data.password);

    await this.userRepo.createUser({
      fullName: data.fullName,
      email: data.email,
      password: hashed,
      role: UserRole.CANDIDATE,
      isEmailVerified: true,
    });

    await this.otpService.deleteRegistrationData(email);
    logger.info(`User registered successfully: ${email}`);
  }
}