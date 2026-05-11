import { randomUUID } from "crypto";
import jwt, { SignOptions } from 'jsonwebtoken';
import { ITokenService, AuthTokens, TokenPayload } from '../../interfaces/service-interfaces/auth/ITokenService';
import { appConfig } from "../../config/appConfig";

export class TokenService implements ITokenService {
  private readonly _accessSecret = appConfig.jwt.accessSecret;
  private readonly _refreshSecret = appConfig.jwt.refreshSecret;
  
  private readonly _accessExpiry = appConfig.jwt.accessExpiry as SignOptions['expiresIn'];
  private readonly _refreshExpiry = appConfig.jwt.refreshExpiry as SignOptions['expiresIn'];

  generateAuthTokens(user: { id: string; role: string }): AuthTokens {
    const refreshTokenId = randomUUID();

    const accessToken = jwt.sign(
      { sub: user.id, role: user.role, type: 'access' },
      this._accessSecret,
      { expiresIn: this._accessExpiry }
    );

    const refreshToken = jwt.sign(
      { sub: user.id, role: user.role, tokenId: refreshTokenId, type: 'refresh' },
      this._refreshSecret,
      { expiresIn: this._refreshExpiry }
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenId,
    };
  }

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, this._accessSecret) as TokenPayload;
  }

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, this._refreshSecret) as TokenPayload;
  }
}
