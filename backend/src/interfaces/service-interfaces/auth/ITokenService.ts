
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
}

export interface TokenPayload {
  sub: string;
  role: string;
  tokenId?: string;
}

export interface ITokenService {
  generateAuthTokens(user: { id: string; role: string }): AuthTokens;
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload;
}
