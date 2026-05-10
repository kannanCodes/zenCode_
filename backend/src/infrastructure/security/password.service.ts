import bcrypt from 'bcrypt';

export const passwordService = {
  hash: (pwd: string): Promise<string> => bcrypt.hash(pwd, 10),
  compare: (plain: string, hashed: string): Promise<boolean> => bcrypt.compare(plain, hashed),
};
