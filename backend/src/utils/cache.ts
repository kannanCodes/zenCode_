import { redisClient } from "../config/redis";
import { ICacheService } from "../interfaces/service-interfaces/ICacheService";

export class CacheService implements ICacheService {
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const data = JSON.stringify(value);

    if (ttlSeconds) {
      await redisClient.set(key, data, "EX", ttlSeconds);
    } else {
      await redisClient.set(key, data);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await redisClient.get(key);
    if (!data) return null;

    return JSON.parse(data) as T;
  }

  async del(key: string): Promise<void> {
    await redisClient.del(key);
  }
}