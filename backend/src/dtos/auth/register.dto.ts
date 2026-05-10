export interface StartRegistrationDTO {
  email: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
}

export interface VerifyRegistrationDTO {
  email: string;
  otp: string;
}
export interface RegistrationCacheDTO {
     fullName: string;
     email: string;
     password: string;
}