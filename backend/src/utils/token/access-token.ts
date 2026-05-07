import jwt, { SignOptions } from 'jsonwebtoken';
import { AccessTokenPayload } from './token.types';
import { ACCESS_TOKEN_EXPIRY } from '../../constants/token.constants';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

if (!ACCESS_SECRET) {
  throw new Error('JWT_ACCESS_SECRET is not defined');
}

export const generateAccessToken = (
  payload: Omit<AccessTokenPayload, 'type'>,
): string => {
  const options: SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRY as SignOptions['expiresIn'] };
  return jwt.sign({ ...payload, type: 'access' }, ACCESS_SECRET!, options);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const payload = jwt.verify(token, ACCESS_SECRET!) as AccessTokenPayload;
  if (payload.type !== 'access') throw new Error('Invalid access token type');
  return payload;
};
