import { IAuthRepository } from '../../interfaces/repository-interfaces/auth/IUserRepository';
import { ILoginService } from '../../interfaces/service-interfaces/auth/ILoginService';
import { passwordService } from '../../infrastructure/security/password.service';
import { ITokenService } from '../../interfaces/service-interfaces/auth/ITokenService';
import { ICacheService } from '../../interfaces/service-interfaces/auth/ICacheService';
import { REDIS_KEYS } from '../../constants/redisKeys';
import { REFRESH_TOKEN_EXPIRY } from '../../constants/token.constants';
import { parseExpiryToSeconds } from "../../shared/utils/expiry.util";

import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import { AUTH_MESSAGES } from "../../constants/messages";
import { logger } from "../../shared/utils/Logger";

import { LoginDTO } from '../../dtos/auth/login.dto';
import { AuthTokensDTO } from '../../dtos/auth/auth-response.dto';
import { RefreshTokenDTO } from '../../dtos/auth/refresh-token.dto';

export class LoginService implements ILoginService {
  constructor(
    private userRepo: IAuthRepository,
    private cacheService: ICacheService,
    private tokenService: ITokenService,
  ) { }

  async login(input: LoginDTO): Promise<AuthTokensDTO> {
    const { email, password } = input;

    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
    if (user.isBlocked) throw new AppError(AUTH_MESSAGES.USER_BLOCKED, STATUS_CODES.FORBIDDEN);
    if (!user.password) throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);

    const isValid = await passwordService.compare(password, user.password);
    if (!isValid) throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);

    user.lastActiveDate = new Date();
    await user.save();

    const { accessToken, refreshToken, refreshTokenId } = this.tokenService.generateAuthTokens({
      id: user.id,
      role: user.role,
    });

    const refreshTTL = parseExpiryToSeconds(REFRESH_TOKEN_EXPIRY);
    await this.cacheService.set(REDIS_KEYS.REFRESH_TOKEN(refreshTokenId), user.id, refreshTTL);

    logger.info(`User logged in: ${email}`);
    return { accessToken, refreshToken };
  }

  async refresh(input: RefreshTokenDTO): Promise<AuthTokensDTO> {
    const { refreshToken } = input;
    const payload = this.tokenService.verifyRefreshToken(refreshToken);

    if (!payload.tokenId) throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
    if (!payload.tokenId) {
      throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
    }
    const oldRefreshKey = REDIS_KEYS.REFRESH_TOKEN(payload.tokenId);
    const storedUserId = await this.cacheService.get<string>(oldRefreshKey);

    if (!storedUserId || storedUserId !== payload.sub) {
      throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
    }

    const user = await this.userRepo.findById(payload.sub);
    if (!user || user.isBlocked) throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);

    await this.cacheService.del(oldRefreshKey);

    user.lastActiveDate = new Date();
    await user.save();

    const { accessToken, refreshToken: newRefreshToken, refreshTokenId } = this.tokenService.generateAuthTokens({
      id: user.id,
      role: user.role,
    });

    const refreshTTL = parseExpiryToSeconds(REFRESH_TOKEN_EXPIRY);
    await this.cacheService.set(REDIS_KEYS.REFRESH_TOKEN(refreshTokenId), user.id, refreshTTL);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = this.tokenService.verifyRefreshToken(refreshToken);
      if (payload.tokenId) {
        await this.cacheService.del(REDIS_KEYS.REFRESH_TOKEN(payload.tokenId));
      }
    } catch (error) {
      logger.warn("Logout failed or token already invalid", error);
    }
  }
}
