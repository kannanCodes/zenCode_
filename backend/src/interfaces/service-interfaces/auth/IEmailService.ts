export interface IEmailService {
  sendOTP(email: string, otp: string): Promise<void>;
  sendPasswordResetLink(email: string, resetLink: string): Promise<void>;
  sendMentorSetupLink(data: { email: string; inviteLink: string; fullName: string }): Promise<void>;
}