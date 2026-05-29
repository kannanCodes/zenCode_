export interface ActivateMentorInput {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface MentorLoginInput {
  email: string;
  password: string;
}

export interface MentorLoginResponse {
  accessToken: string;
}

export interface MentorForgotPasswordInput {
  email: string;
}

export interface MentorResetPasswordInput {
  token: string;
  password: string;
  confirmPassword: string;
}
