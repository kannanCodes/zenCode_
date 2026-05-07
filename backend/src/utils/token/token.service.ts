import { randomUUID } from 'crypto';
import { UserRole } from '../../constants/roles';
import { generateAccessToken, verifyAccessToken } from './access-token';
import { generateRefreshToken, verifyRefreshToken } from './refresh-token';

export const TokenService = {
  generateAuthTokens(user: { id: string; role: UserRole }) {
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
  },

  verifyAccessToken,
  verifyRefreshToken,
};
