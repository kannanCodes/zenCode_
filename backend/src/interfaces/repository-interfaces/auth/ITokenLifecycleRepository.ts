export interface ITokenLifecycleRepository {
  issuePasswordResetToken(params: {
    hashedToken: string;
    userId: string;
    ttlSeconds: number;
  }): Promise<void>;
  getPasswordResetUserId(hashedToken: string): Promise<string | null>;
  isPasswordResetTokenValid(hashedToken: string): Promise<boolean>;
  consumePasswordResetToken(hashedToken: string): Promise<string | null>;

  issueMentorInviteToken(params: {
    token: string;
    email: string;
    ttlSeconds: number;
  }): Promise<void>;
  getValidMentorInviteEmail(token: string): Promise<string | null>;
  consumeMentorInviteToken(params: {
    token: string;
    email: string;
  }): Promise<void>;
}
