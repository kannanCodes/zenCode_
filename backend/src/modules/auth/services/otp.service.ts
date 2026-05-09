import { IOTPService } from "../interfaces/service-interfaces/IOTPService";
import { ICacheService } from "../../../shared/interfaces/cache-service.interface";
import { REDIS_KEYS } from "../constants/redisKeys";
import { AppError } from "../../../shared/utils/AppError";
import { AUTH_MESSAGES } from "../constants/auth.messages";
import { STATUS_CODES } from "../../../shared/constants/status";
import { appConfig } from "../../../config/appConfig";

export class OTPService implements IOTPService {
  constructor(private cacheService: ICacheService) {}

     generateOTP(): string {
          const { min, max } = appConfig.otp;
          return Math.floor(min + Math.random() * (max - min + 1)).toString();
     }

     async storeOTP(email: string, otp: string): Promise<void> {
          await this.cacheService.set(REDIS_KEYS.OTP(email), otp, 300);
     }

     async verifyOTP(email: string, otp: string): Promise<boolean> {
          const attemptKey = `otp-attempt:${email}`;
          const attempts = await this.cacheService.get<number>(attemptKey) || 0;

          if (attempts >= 5) {
               throw new AppError(AUTH_MESSAGES.TOO_MANY_ATTEMPTS, STATUS_CODES.TOO_MANY_REQUESTS);
          }

          const stored = await this.cacheService.get<string>(REDIS_KEYS.OTP(email));

          if (!stored || stored !== otp) {
               await this.cacheService.set(attemptKey, attempts + 1, 300); // 5 min block/tracking
               return false;
          }

          await this.cacheService.del(REDIS_KEYS.OTP(email));
          await this.cacheService.del(attemptKey);
          return true;
     }

     async storeRegistrationData<T>(email: string, data: T): Promise<void> {
          await this.cacheService.set(REDIS_KEYS.REGISTRATION(email), data, 300);
     }

     async getRegistrationData<T>(email: string): Promise<T | null> {
          return this.cacheService.get<T>(REDIS_KEYS.REGISTRATION(email));
     }

     async deleteRegistrationData(email: string): Promise<void> {
          await this.cacheService.del(REDIS_KEYS.REGISTRATION(email));
     }
}
