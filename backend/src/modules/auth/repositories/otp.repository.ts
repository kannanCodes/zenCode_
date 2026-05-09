import { IOTPRepository, OTPMeta } from "../interfaces/repository-interfaces/IOTPRepository";
import { ICacheService } from "../../../shared/interfaces/cache-service.interface";
import { REDIS_KEYS } from "../constants/redisKeys";

export class OTPRepository implements IOTPRepository {
  constructor(private cacheService: ICacheService) {}

  async getMeta(email: string): Promise<OTPMeta | null> {
    return this.cacheService.get<OTPMeta>(REDIS_KEYS.OTP_META(email));
  }

  async saveMeta(email: string, meta: OTPMeta, ttl: number): Promise<void> {
    await this.cacheService.set(REDIS_KEYS.OTP_META(email), meta, ttl);
  }

  async clearAll(email: string): Promise<void> {
    await this.cacheService.del(REDIS_KEYS.OTP(email));
    await this.cacheService.del(REDIS_KEYS.OTP_META(email));
  }
}
