import { randomUUID } from 'crypto';
import { UserRole } from '../../constants/roles';
import { generateAccessToken, verifyAccessToken } from '../../utils/token/access-token';
import { generateRefreshToken, verifyRefreshToken } from '../../utils/token/refresh-token';
import { ITokenService, AuthTokens } from '../../interfaces/service-interfaces/auth/ITokenService';
import { AccessTokenPayload, RefreshTokenPayload } from '../../utils/token/token.types';

export class TokenService implements ITokenService {
  generateAuthTokens(user: { id: string; role: UserRole }): AuthTokens {
    const refreshTokenId = randomUUID();

    const accessToken = generateAccessToken({
      sub: user.id,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      sub: user.id,
      tokenId: refreshTokenId,
    });

    return { accessToken, refreshToken, refreshTokenId };
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return verifyAccessToken(token);
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return verifyRefreshToken(token);
  }
}
