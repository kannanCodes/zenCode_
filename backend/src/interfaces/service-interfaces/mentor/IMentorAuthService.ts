import { ActivateMentorInput, MentorLoginInput, MentorResetPasswordInput } from "../../../dtos/mentor/mentor-auth.dto";

export interface IMentorAuthService {
  activateMentor(input: ActivateMentorInput): Promise<void>;
  validateActivationToken(token: string): Promise<boolean>;
  login(input: MentorLoginInput): Promise<{ accessToken: string; refreshToken: string }>;
  refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
  logout(refreshToken: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(input: MentorResetPasswordInput): Promise<void>;
  validateResetToken(token: string): Promise<boolean>;
}
