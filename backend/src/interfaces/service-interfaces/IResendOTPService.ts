export interface IResendOTPService {
  resend(email: string): Promise<void>;
}
