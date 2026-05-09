import { randomUUID } from "crypto";
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRole } from "../constants/roles";
import { ITokenService, AuthTokens, TokenPayload } from '../interfaces/token-service.interface';
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from '../../modules/auth/constants/token.constants';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('JWT secrets are not defined');
}

export class TokenService implements ITokenService {
  generateAuthTokens(user: { id: string; role: UserRole }): AuthTokens {
    const refreshTokenId = randomUUID();

    const accessOptions: SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRY as SignOptions['expiresIn'] };
    const accessToken = jwt.sign(
      { sub: user.id, role: user.role, type: 'access' },
      ACCESS_SECRET!,
      accessOptions
    );

    const refreshOptions: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRY as SignOptions['expiresIn'] };
    const refreshToken = jwt.sign(
      { sub: user.id, tokenId: refreshTokenId, type: 'refresh' },
      REFRESH_SECRET!,
      refreshOptions
    );

    return { accessToken, refreshToken, refreshTokenId };
  }

  verifyAccessToken(token: string): TokenPayload {
    const payload = jwt.verify(token, ACCESS_SECRET!) as TokenPayload & { type: string };
    if (payload.type !== 'access') throw new Error('Invalid access token type');
    return payload;
  }

  verifyRefreshToken(token: string): TokenPayload {
    const payload = jwt.verify(token, REFRESH_SECRET!) as TokenPayload & { type: string };
    if (payload.type !== 'refresh') throw new Error('Invalid refresh token type');
    return payload;
  }
}
