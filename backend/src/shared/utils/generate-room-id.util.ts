import crypto from 'crypto';

export const generateRoomId = (): string => {
  return `room_${crypto.randomBytes(8).toString('hex')}`;
};
