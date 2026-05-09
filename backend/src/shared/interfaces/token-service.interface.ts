import { UserRole } from "../constants/roles";

export interface TokenPayload {
  sub: string;
  role?: UserRole;
  tokenId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
}

export interface ITokenService {
  generateAuthTokens(user: { id: string; role: UserRole }): AuthTokens;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
}
