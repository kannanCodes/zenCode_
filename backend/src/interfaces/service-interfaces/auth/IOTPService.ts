export interface IOTPService {
     generateOTP(): string;
     storeOTP(email: string, otp: string): Promise<void>;
     verifyOTP(email: string, otp: string): Promise<boolean>;

     storeRegistrationData<T>(email: string, data: T): Promise<void>;
     getRegistrationData<T>(email: string): Promise<T | null>;
     deleteRegistrationData(email: string): Promise<void>;
}