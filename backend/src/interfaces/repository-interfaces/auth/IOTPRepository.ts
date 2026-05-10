export interface OTPMeta {
  resendCount: number;
  lastSend: number;
}

export interface IOTPRepository {
  getMeta(email: string): Promise<OTPMeta | null>;
  saveMeta(email: string, meta: OTPMeta, ttl: number): Promise<void>;
  clearAll(email: string): Promise<void>;
}