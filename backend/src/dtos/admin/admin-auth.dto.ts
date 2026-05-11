export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  accessToken: string;
}
