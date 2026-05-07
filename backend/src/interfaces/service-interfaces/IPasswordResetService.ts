import { ResetPasswordDTO } from '../../dtos/ResetPasswordDTO';

export interface IPasswordResetService {
  forgotPassword(email: string): Promise<void>;
  resetPassword(input: ResetPasswordDTO): Promise<void>;
  validateResetToken(token: string): Promise<boolean>;
}

