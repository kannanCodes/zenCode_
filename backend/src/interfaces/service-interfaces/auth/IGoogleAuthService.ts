import { AuthTokensDTO } from '../../../dtos/auth/auth-response.dto';

export interface GoogleProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string; verified: boolean }>;
  photos?: Array<{ value: string }>;
}

export interface IGoogleAuthService {
  authenticateGoogleUser(profile: GoogleProfile): Promise<AuthTokensDTO>;
}

