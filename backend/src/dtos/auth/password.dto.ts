export interface ForgotPasswordDTO {
  email: string;
}
export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
