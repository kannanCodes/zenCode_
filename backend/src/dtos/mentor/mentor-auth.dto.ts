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
