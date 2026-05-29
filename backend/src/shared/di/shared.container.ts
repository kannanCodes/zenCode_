import { ICacheService } from '../../interfaces/service-interfaces/auth/ICacheService';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { EmailService } from '../../infrastructure/email/email.service';
import { TokenService } from '../../services/shared/TokenService';
import { PasswordService } from '../../infrastructure/security/password.service';
import { TokenLifecycleRepository } from '../../repositories/auth/TokenLifecycleRepository';
import { ITokenLifecycleRepository } from '../../interfaces/repository-interfaces/auth/ITokenLifecycleRepository';
import { IStorageService } from '../../interfaces/infrastructure-interfaces/storage/IStorageService';
import { S3StorageService } from '../../infrastructure/storage/s3-storage.service';

// ── Shared utilities ───────────────────────────────────────────────────────────
export const cacheService: ICacheService = new CacheService();

export const emailService = new EmailService();
export const tokenLifecycleRepository: ITokenLifecycleRepository = new TokenLifecycleRepository(cacheService);
export const storageService: IStorageService = new S3StorageService();

// ── Shared Services ────────────────────────────────────────────────────────────
export const tokenService = new TokenService();
export const passwordService = new PasswordService();
