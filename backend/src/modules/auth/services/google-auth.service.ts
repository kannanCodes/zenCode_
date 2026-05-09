import { IAuthRepository } from '../interfaces/repository-interfaces/IUserRepository';
import { IGoogleAuthService, GoogleProfile } from '../interfaces/service-interfaces/IGoogleAuthService';
import { ITokenService } from '../../../shared/interfaces/token-service.interface';

import { ICacheService } from '../../../shared/interfaces/cache-service.interface';
import { REDIS_KEYS } from '../constants/redisKeys';
import { REFRESH_TOKEN_EXPIRY } from '../constants/token.constants';
import { parseExpiryToSeconds } from '../../../shared/utils/expiry.util';
import { UserRole } from '../../../shared/constants/roles';
import { AppError } from '../../../shared/utils/AppError';
import { STATUS_CODES } from '../../../shared/constants/status';
import { AUTH_MESSAGES } from '../constants/auth.messages';
import { logger } from '../../../shared/utils/Logger';

import { AuthTokensDTO } from '../dtos/AuthResponseDTO';

export class GoogleAuthService implements IGoogleAuthService {
  constructor(
    private userRepo: IAuthRepository,
    private cacheService: ICacheService,
    private tokenService: ITokenService,
  ) {}

  async authenticateGoogleUser(
    profile: GoogleProfile,
  ): Promise<AuthTokensDTO> {

    const email = profile.emails[0].value;
    const googleId = profile.id;

    let user = await this.userRepo.findByEmail(email);

    if (!user) {
      user = await this.userRepo.createUser({
        fullName: profile.displayName,
        email,
        googleId,
        role: UserRole.CANDIDATE,
        isEmailVerified: true,
      });
      logger.info(`New Google user created: ${email}`);
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
        user.isEmailVerified = true;
        await user.save();
      }

      if (user.isBlocked) {
        throw new AppError(AUTH_MESSAGES.USER_BLOCKED, STATUS_CODES.FORBIDDEN);
      }
    }

    user.lastActiveDate = new Date();
    await user.save();

    const { accessToken, refreshToken, refreshTokenId } = this.tokenService.generateAuthTokens({
      id: user.id,
      role: user.role,
    });

    const refreshTTL = parseExpiryToSeconds(REFRESH_TOKEN_EXPIRY);
    await this.cacheService.set(REDIS_KEYS.REFRESH_TOKEN(refreshTokenId), user.id, refreshTTL);

    return { accessToken, refreshToken };
  }
}
