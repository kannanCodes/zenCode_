import { ICacheService } from "../interfaces/service-interfaces/auth/ICacheService";

export class InMemoryCacheService implements ICacheService {
  private cache = new Map<string, { value: unknown; expiry: number | null }>();

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.cache.set(key, { value, expiry });
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expiry && entry.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }
}
