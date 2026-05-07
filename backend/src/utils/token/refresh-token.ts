import jwt, { SignOptions } from 'jsonwebtoken';
import { RefreshTokenPayload } from './token.types';
import { REFRESH_TOKEN_EXPIRY } from '../../constants/token.constants';

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!REFRESH_SECRET) {
  throw new Error('JWT_REFRESH_SECRET is not defined');
}

export const generateRefreshToken = (
  payload: Omit<RefreshTokenPayload, 'type'>,
): string => {
  const options: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRY as SignOptions['expiresIn'] };
  return jwt.sign({ ...payload, type: 'refresh' }, REFRESH_SECRET!, options);
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const payload = jwt.verify(token, REFRESH_SECRET!) as RefreshTokenPayload;
  if (payload.type !== 'refresh') throw new Error('Invalid refresh token type');
  return payload;
};
