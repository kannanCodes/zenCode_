import { ICacheService } from '../../interfaces/service-interfaces/auth/ICacheService';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { InMemoryCacheService } from '../../infrastructure/cache/in-memory-cache.service';
import { EmailService } from '../../infrastructure/email/email.service';
import { TokenService } from '../../services/shared/TokenService';

// ── Shared utilities ───────────────────────────────────────────────────────────
export const cacheService: ICacheService = process.env.NODE_ENV === 'test'
  ? new InMemoryCacheService()
  : new CacheService();

export const emailService = new EmailService();

// ── Shared Services ────────────────────────────────────────────────────────────
export const tokenService = new TokenService();
