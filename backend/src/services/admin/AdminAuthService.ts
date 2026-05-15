import { IAdminAuthRepository } from "../../interfaces/repository-interfaces/admin/IAdminAuthRepository";
import { IAdminAuthService } from "../../interfaces/service-interfaces/admin/IAdminAuthService";
import { AdminLoginInput } from "../../dtos/admin/admin-auth.dto";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import { AUTH_MESSAGES } from "../../constants/messages";
import { IPasswordService } from "../../interfaces/infrastructure-interfaces/security/IPasswordService";
import { ITokenService } from "../../interfaces/service-interfaces/auth/ITokenService";
import { ICacheService } from "../../interfaces/service-interfaces/auth/ICacheService";
import { REDIS_KEYS } from "../../constants/redisKeys";
import { parseExpiryToSeconds } from "../../shared/utils/expiry.util";
import { REFRESH_TOKEN_EXPIRY } from "../../constants/token.constants";

export class AdminAuthService implements IAdminAuthService {
  constructor(
    private readonly _adminAuthRepository: IAdminAuthRepository,
    private readonly _cacheService: ICacheService,
    private readonly _tokenService: ITokenService,
    private readonly _passwordService: IPasswordService
  ) { }

  async login(input: AdminLoginInput) {
    const { email, password } = input;

    const admin = await this._adminAuthRepository.findAdminByEmail(email);

    if (!admin) {
      throw new AppError(AUTH_MESSAGES.USER_NOT_FOUND, STATUS_CODES.UNAUTHORIZED);
    }
    if (admin.isBlocked) {
      throw new AppError(AUTH_MESSAGES.USER_BLOCKED, STATUS_CODES.FORBIDDEN);
    }
    if (!admin.password) {
      throw new AppError(AUTH_MESSAGES.USER_NOT_FOUND, STATUS_CODES.UNAUTHORIZED);
    }
    const isMatch = await this._passwordService.compare(password, admin.password);
    if (!isMatch) {
      throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
    }

    const { accessToken, refreshToken, refreshTokenId } = this._tokenService.generateAuthTokens({
      id: admin.id,
      role: admin.role,
    });

    const refreshKey = REDIS_KEYS.REFRESH_TOKEN(refreshTokenId);
    const refreshTTL = parseExpiryToSeconds(REFRESH_TOKEN_EXPIRY);
    await this._cacheService.set(refreshKey, admin.id, refreshTTL);

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = this._tokenService.verifyRefreshToken(refreshToken);

    if (!payload.tokenId) {
      throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
    }

    const oldRefreshKey = REDIS_KEYS.REFRESH_TOKEN(payload.tokenId);
    const storedUserId = await this._cacheService.get<string>(oldRefreshKey);

    if (!storedUserId || storedUserId !== payload.sub) {
      throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
    }

    const admin = await this._adminAuthRepository.findById(payload.sub);

    if (!admin || admin.isBlocked) {
      throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
    }

    await this._cacheService.del(oldRefreshKey);

    const { accessToken, refreshToken: newRefreshToken, refreshTokenId } =
      this._tokenService.generateAuthTokens({ id: admin.id, role: admin.role });

    const newRefreshKey = REDIS_KEYS.REFRESH_TOKEN(refreshTokenId);
    const refreshTTL = parseExpiryToSeconds(REFRESH_TOKEN_EXPIRY);
    await this._cacheService.set(newRefreshKey, admin.id, refreshTTL);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    let payload;
    try {
      payload = this._tokenService.verifyRefreshToken(refreshToken);
    } catch {
      return;
    }
    if (payload.tokenId) {
      const refreshKey = REDIS_KEYS.REFRESH_TOKEN(payload.tokenId);
      await this._cacheService.del(refreshKey);
    }
  }
}
