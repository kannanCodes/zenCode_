export interface ICacheService {
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  ttl(key: string): Promise<number>;
  del(key: string): Promise<void>;
}
