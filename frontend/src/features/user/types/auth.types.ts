export interface RegistrationRequest {
     fullName: string;
     email: string;
     password: string;
     confirmPassword: string;
}

export interface VerifyOTPRequest {
     email: string;
     otp: string;
}