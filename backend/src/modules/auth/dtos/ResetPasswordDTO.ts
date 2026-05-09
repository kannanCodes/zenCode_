export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
