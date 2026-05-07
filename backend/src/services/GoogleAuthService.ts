import { IAuthRepository } from '../interfaces/repository-interfaces/IUserRepository';
import { IGoogleAuthService, GoogleProfile } from '../interfaces/service-interfaces/IGoogleAuthService';
import { TokenService } from '../utils/token/token.service';
import { ICacheService } from '../interfaces/service-interfaces/ICacheService';
import { REDIS_KEYS } from '../constants/redisKeys';
import { REFRESH_TOKEN_EXPIRY } from '../constants/token.constants';
import { parseExpiryToSeconds } from '../utils/expiry.util';
import { UserRole } from '../constants/roles';
import { AppError } from '../utils/AppError';
import { STATUS_CODES } from '../constants/status';
import { AUTH_MESSAGES } from '../constants/messages';
import { logger } from '../utils/Logger';

import { AuthTokensDTO } from '../dtos/AuthResponseDTO';

export class GoogleAuthService implements IGoogleAuthService {
  constructor(
    private userRepo: IAuthRepository,
    private cacheService: ICacheService,
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

    const { accessToken, refreshToken, refreshTokenId } = TokenService.generateAuthTokens({
      id: user.id,
      role: user.role,
    });

    const refreshTTL = parseExpiryToSeconds(REFRESH_TOKEN_EXPIRY);
    await this.cacheService.set(REDIS_KEYS.REFRESH_TOKEN(refreshTokenId), user.id, refreshTTL);

    return { accessToken, refreshToken };
  }
}
