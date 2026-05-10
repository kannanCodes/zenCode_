import { UserRole } from '../../../constants/roles';
import { AccessTokenPayload, RefreshTokenPayload } from '../../../utils/token/token.types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
}

export interface ITokenService {
  generateAuthTokens(user: { id: string; role: UserRole }): AuthTokens;
  verifyAccessToken(token: string): AccessTokenPayload;
  verifyRefreshToken(token: string): RefreshTokenPayload;
}
