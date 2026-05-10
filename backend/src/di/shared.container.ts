import { EmailService } from '../utils/email';
import { ICacheService } from '../interfaces/service-interfaces/auth/ICacheService';
import { CacheService } from '../utils/cache';
import { InMemoryCacheService } from '../utils/InMemoryCacheService';
import { TokenService } from '../services/shared/TokenService';

// ── Shared utilities ───────────────────────────────────────────────────────────
export const cacheService: ICacheService = process.env.NODE_ENV === 'test'
  ? new InMemoryCacheService()
  : new CacheService();

export const emailService = new EmailService();

// ── Shared Services ────────────────────────────────────────────────────────────
export const tokenService = new TokenService();
