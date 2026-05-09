export const EXPIRY_TIMES = {
  OTP: {
    SECONDS: 300,
    LABEL: '5 minutes',
  },
  PASSWORD_RESET: {
    SECONDS: 900,
    LABEL: '15 minutes',
  },
  MENTOR_INVITE: {
    SECONDS: 86400,
    LABEL: '24 hours',
  },
};

export function parseExpiryToSeconds(expiry: string | number): number {
  if (typeof expiry === 'number') return expiry;
  
  const match = expiry.match(/^(\d+)([dhms])$/);
  if (!match) return parseInt(expiry, 10) || 0;
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 'd': return value * 24 * 60 * 60;
    case 'h': return value * 60 * 60;
    case 'm': return value * 60;
    case 's': return value;
    default: return value;
  }
}
