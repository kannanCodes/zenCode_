// services/OTPService.ts

import { IOTPService } from '../../interfaces/service-interfaces/auth/IOTPService';
import { ICacheService } from '../../interfaces/service-interfaces/auth/ICacheService';
import { REDIS_KEYS } from '../../constants/redisKeys';
import { AppError } from "../../shared/utils/AppError";
import { AUTH_MESSAGES } from "../../constants/messages";
import { STATUS_CODES } from "../../shared/constants/status";
import { appConfig } from '../../config/appConfig';
import { EXPIRY_TIMES } from '../../shared/utils/expiry.util';
import { OTP_LIMITS } from '../../constants/otp.constants';



export class OTPService implements IOTPService {
     constructor(private cacheService: ICacheService) { }

     generateOTP(): string {
          const min = Number(appConfig.otp.min);
          const max = Number(appConfig.otp.max);
          return Math.floor(min + Math.random() * (max - min)).toString();
     }

     async storeOTP(email: string, otp: string): Promise<void> {
          await this.cacheService.set(REDIS_KEYS.OTP(email), otp, EXPIRY_TIMES.OTP.SECONDS);
     }

     async verifyOTP(email: string, otp: string): Promise<boolean> {
          const attemptKey = REDIS_KEYS.OTP_ATTEMPT(email);
          const attempts = await this.cacheService.get<number>(attemptKey) || 0;

          if (attempts >= OTP_LIMITS.MAX_VERIFY_ATTEMPTS) {
               throw new AppError(AUTH_MESSAGES.TOO_MANY_ATTEMPTS, STATUS_CODES.TOO_MANY_REQUESTS);
          }

          const stored = await this.cacheService.get<string>(REDIS_KEYS.OTP(email));

          if (!stored || stored !== otp) {
               await this.cacheService.set(attemptKey, attempts + 1, EXPIRY_TIMES.OTP.SECONDS);
               return false;
          }

          await this.cacheService.del(REDIS_KEYS.OTP(email));
          await this.cacheService.del(attemptKey);
          return true;
     }

     async storeRegistrationData<T>(email: string, data: T): Promise<void> {
          await this.cacheService.set(REDIS_KEYS.REGISTRATION(email), data, EXPIRY_TIMES.OTP.SECONDS);
     }

     async getRegistrationData<T>(email: string): Promise<T | null> {
          return this.cacheService.get<T>(REDIS_KEYS.REGISTRATION(email));
     }

     async deleteRegistrationData(email: string): Promise<void> {
          await this.cacheService.del(REDIS_KEYS.REGISTRATION(email));
     }
}

