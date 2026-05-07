//Converts a JWT-style expiry string ('7d', '15m', '3600s', '3600') to seconds.
export const parseExpiryToSeconds = (expiry: string): number => {
  const match = expiry.match(/^(\d+)([smhd]?)$/);
  if (!match) return 3600;

  const value = parseInt(match[1], 10);
  const unit  = match[2] || 's';

  switch (unit) {
    case 'd': return value * 86400;
    case 'h': return value * 3600;
    case 'm': return value * 60;
    case 's':
    default:  return value;
  }
};
