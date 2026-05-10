import { randomUUID } from "crypto";
import jwt, { SignOptions } from 'jsonwebtoken';
import { ITokenService, AuthTokens, TokenPayload } from '../../interfaces/service-interfaces/auth/ITokenService';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Hardcoded for now if env not loaded in tests, but should be in env
const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT secrets are not defined');
  }
}

export class TokenService implements ITokenService {
  generateAuthTokens(user: { id: string; role: string }): AuthTokens {
    const refreshTokenId = randomUUID();

    const accessToken = jwt.sign(
      { sub: user.id, role: user.role, type: 'access' },
      ACCESS_SECRET || 'dev_access_secret',
      { expiresIn: ACCESS_EXPIRY as SignOptions['expiresIn'] }
    );

    const refreshToken = jwt.sign(
      { sub: user.id, tokenId: refreshTokenId, type: 'refresh' },
      REFRESH_SECRET || 'dev_refresh_secret',
      { expiresIn: REFRESH_EXPIRY as SignOptions['expiresIn'] }
    );

    return { accessToken, refreshToken, refreshTokenId };
  }

  verifyAccessToken(token: string): TokenPayload {
    const payload = jwt.verify(token, ACCESS_SECRET || 'dev_access_secret') as TokenPayload & { type: string };
    if (payload.type !== 'access') throw new Error('Invalid access token type');
    return payload;
  }

  verifyRefreshToken(token: string): TokenPayload {
    const payload = jwt.verify(token, REFRESH_SECRET || 'dev_refresh_secret') as TokenPayload & { type: string };
    if (payload.type !== 'refresh') throw new Error('Invalid refresh token type');
    return payload;
  }
}
